// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { test, expect } from '@playwright/test';

const ONE_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test.beforeEach(async ({ page }) => {
  await page.route('**/thumbnail/**', function respondWithPlaceholderImage(route) {
    route.fulfill({ contentType: 'image/png', body: Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64') });
  });
});

test('updating the threshold slider re-renders the canvas', async ({ page }) => {
  await page.goto('/preview/salamander1.mp4');

  const canvas = page.getByTestId('thumbnail-canvas');
  await expect(canvas).toBeVisible();

  const slider = page.getByRole('slider');
  await slider.focus();
  await slider.press('ArrowRight');

  await expect(canvas).toBeVisible();
});

test('shows an error when the thumbnail fails to load', async ({ page }) => {
  await page.route('**/thumbnail/**', function respondWithServerError(route) {
    route.fulfill({ status: 500, json: { error: 'Error generating thumbnail' } });
  });

  await page.goto('/preview/salamander1.mp4');

  await expect(page.getByText(/couldn't load this video's first frame/i)).toBeVisible();
});

test('clicking back to videos returns to the chooser page', async ({ page }) => {
  await page.goto('/preview/salamander1.mp4');

  await page.getByRole('button', { name: /back to videos/i }).click();

  await expect(page).toHaveURL(/\/videos$/);
  await expect(page.getByRole('heading', { name: /choose a video/i })).toBeVisible();
});

test('clicking process shows a job status once the backend responds', async ({ page }) => {
  await page.route('**/process/salamander1.mp4*', function respondWithJobId(route) {
    route.fulfill({ json: { jobId: 'test-job-1' } });
  });
  await page.route('**/process/test-job-1/status', function respondWithDoneStatus(route) {
    route.fulfill({ json: { status: 'done', result: '/results/3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b.csv' } });
  });

  await page.goto('/preview/salamander1.mp4');
  await page.getByRole('button', { name: /process video/i }).click();

  await expect(page.getByText(/processing complete/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /download csv/i })).toBeVisible();
});

// F-S1: a result link that is not /results/<uuid>.csv must never become a download href.
test('shows an error instead of a download link when the result link is not a results path', async ({ page }) => {
  await page.route('**/process/salamander1.mp4*', function respondWithJobId(route) {
    route.fulfill({ json: { jobId: 'test-job-2' } });
  });
  await page.route('**/process/test-job-2/status', function respondWithBadLink(route) {
    route.fulfill({ json: { status: 'done', result: 'javascript:alert(1)' } });
  });

  await page.goto('/preview/salamander1.mp4');
  await page.getByRole('button', { name: /process video/i }).click();

  await expect(page.getByText(/invalid result link/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /download csv/i })).toHaveCount(0);
});

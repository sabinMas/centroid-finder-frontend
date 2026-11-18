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

test('clicking process shows a job status once the backend responds', async ({ page }) => {
  await page.route('**/process/salamander1.mp4*', function respondWithJobId(route) {
    route.fulfill({ json: { jobId: 'test-job-1' } });
  });
  await page.route('**/process/test-job-1/status', function respondWithDoneStatus(route) {
    route.fulfill({ json: { status: 'done', result: '/results/test-job-1.csv' } });
  });

  await page.goto('/preview/salamander1.mp4');
  await page.getByRole('button', { name: /process video/i }).click();

  await expect(page.getByText(/processing complete/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /download csv/i })).toBeVisible();
});

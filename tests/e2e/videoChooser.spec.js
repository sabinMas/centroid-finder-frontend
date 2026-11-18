// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { test, expect } from '@playwright/test';

test('redirects / to /videos', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/videos$/);
});

test('renders a list entry for each available video and navigates to its preview page', async ({ page }) => {
  await page.route('**/api/videos', function respondWithVideoList(route) {
    route.fulfill({ json: ['salamander1.mp4', 'salamander2.mov'] });
  });

  await page.goto('/videos');

  await expect(page.getByText('salamander1.mp4')).toBeVisible();
  await expect(page.getByText('salamander2.mov')).toBeVisible();

  await page.getByText('salamander1.mp4').click();

  await expect(page).toHaveURL(/\/preview\/salamander1\.mp4$/);
});

test('falls back to sample videos with a notice when the backend is unreachable', async ({ page }) => {
  await page.route('**/api/videos', function respondWithServerError(route) {
    route.fulfill({ status: 500, json: { error: 'Error reading video directory' } });
  });

  await page.goto('/videos');

  await expect(page.getByText(/couldn't reach the backend/i)).toBeVisible();
  await expect(page.getByText('salamander1.mp4')).toBeVisible();
});

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

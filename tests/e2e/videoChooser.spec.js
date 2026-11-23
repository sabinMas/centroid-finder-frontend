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

// F-E1: replaced the old "falls back to sample videos" test with the three
// states the new error-handling UI must cover.

test('shows a spinner while the video list is loading', async ({ page }) => {
  // Hold the response so the page stays in the loading state long enough to assert.
  let resolveRoute;
  await page.route('**/api/videos', function holdRequest(route) {
    resolveRoute = () => route.fulfill({ json: ['salamander1.mp4'] });
  });

  await page.goto('/videos');

  // The loading spinner must appear while the request is in flight.
  await expect(page.getByLabel('Loading videos')).toBeVisible();

  // Resolve the held request and confirm the list appears (not stuck on spinner).
  resolveRoute();
  await expect(page.getByText('salamander1.mp4')).toBeVisible();
  await expect(page.getByLabel('Loading videos')).not.toBeVisible();
});

test('shows an error and a Retry button when the backend fails, then loads on retry', async ({ page }) => {
  // Always return a 500 on initial load. Using a fixed handler (not a counter)
  // so React Strict Mode's double effect invocation doesn't consume the success
  // slot before we ever see the error state.
  await page.route('**/api/videos', function alwaysFail(route) {
    route.fulfill({ status: 500, json: { error: 'Error reading video directory' } });
  });

  await page.goto('/videos');

  // Error state: message visible, no fake videos.
  await expect(page.getByText(/couldn't load the video list/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  await expect(page.getByText('salamander1.mp4')).not.toBeVisible();

  // Swap the route to return a real list, then click Retry.
  await page.unroute('**/api/videos');
  await page.route('**/api/videos', function succeed(route) {
    route.fulfill({ json: ['salamander1.mp4'] });
  });

  await page.getByRole('button', { name: /retry/i }).click();
  await expect(page.getByText('salamander1.mp4')).toBeVisible();
  await expect(page.getByText(/couldn't load the video list/i)).not.toBeVisible();
});

test('shows "No videos found" when the backend returns an empty list', async ({ page }) => {
  await page.route('**/api/videos', function respondWithEmptyList(route) {
    route.fulfill({ json: [] });
  });

  await page.goto('/videos');

  await expect(page.getByText(/no videos found/i)).toBeVisible();
});

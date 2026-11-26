// F-N1: the navigation bar. Each tab and link must open its route, the current
// tab must be highlighted, and the original tool must keep working under "Track color".
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/videos', function respondWithVideoList(route) {
    route.fulfill({ json: ['salamander1.mp4'] });
  });
});

test('redirects / to /videos and highlights the Track color tab', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/videos$/);
  await expect(page.getByRole('tab', { name: 'Track color' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Metadata' })).toHaveAttribute('aria-selected', 'false');
});

test('the Metadata tab opens /metadata and is highlighted', async ({ page }) => {
  await page.goto('/videos');
  await page.getByRole('tab', { name: 'Metadata' }).click();
  await expect(page).toHaveURL(/\/metadata$/);
  await expect(page.getByRole('heading', { name: 'Metadata' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Metadata' })).toHaveAttribute('aria-selected', 'true');
});

test('the Jobs tab opens /jobs and is highlighted', async ({ page }) => {
  await page.goto('/videos');
  await page.getByRole('tab', { name: 'Jobs' }).click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Jobs' })).toHaveAttribute('aria-selected', 'true');
});

test('Help, Settings and Sign in open their pages and no tool tab is highlighted', async ({ page }) => {
  await page.goto('/videos');
  const links = [
    ['Help', /\/help$/],
    ['Settings', /\/settings$/],
    ['Sign in', /\/sign-in$/],
  ];
  for (const [name, url] of links) {
    await page.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(url);
    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.getByRole('tab', { selected: true })).toHaveCount(0);
  }
});

test('Track color stays highlighted on a preview page and brings you back to /videos', async ({ page }) => {
  await page.route('**/thumbnail/**', function respondWithNothing(route) {
    route.fulfill({ status: 404, json: { error: 'No thumbnail' } });
  });
  await page.goto('/preview/salamander1.mp4');
  await expect(page.getByRole('tab', { name: 'Track color' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Jobs' }).click();
  await page.getByRole('tab', { name: 'Track color' }).click();
  await expect(page).toHaveURL(/\/videos$/);
});

test('the Metadata route accepts an optional filename', async ({ page }) => {
  await page.goto('/metadata/salamander1.mp4');
  await expect(page.getByRole('heading', { name: 'Metadata' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Metadata' })).toHaveAttribute('aria-selected', 'true');
});

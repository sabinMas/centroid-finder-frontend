import { test, expect } from '@playwright/test';

const ONE_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

// Sample 2 jumps to (90, 90) and straight back: one tracking glitch.
const TRAIL_CSV = '0.00,10,10\n0.50,11,11\n1.00,90,90\n1.50,12,12\n';

test.beforeEach(async ({ page }) => {
  await page.route('**/thumbnail/**', function respondWithPlaceholderImage(route) {
    route.fulfill({ contentType: 'image/png', body: Buffer.from(ONE_PIXEL_PNG_BASE64, 'base64') });
  });
  await page.route('**/results/replay-job.csv', function respondWithTrailCsv(route) {
    route.fulfill({ contentType: 'text/csv', body: TRAIL_CSV });
  });
});

async function mockDoneJob(page) {
  await page.route('**/process/replay-job/status', function respondWithDoneStatus(route) {
    route.fulfill({ json: { status: 'done', result: '/results/replay-job.csv' } });
  });
}

test('shows trail stats and flags tracking glitches', async ({ page }) => {
  await mockDoneJob(page);
  await page.goto('/replay/salamander1.mp4/replay-job');

  await expect(page.getByRole('heading', { name: 'Trail Replay' })).toBeVisible();
  await expect(page.getByTestId('trail-canvas')).toBeVisible();
  await expect(page.getByText('Tracking glitches')).toBeVisible();
  await expect(page.getByText('1 (0:00)')).toBeVisible();
  await expect(page.getByText('75%')).toBeVisible();

  const timeline = page.getByRole('slider', { name: 'Timeline' });
  await timeline.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText(/tracking glitch: jumped to noise/i)).toBeVisible();
});

test('the finished job panel links to the trail replay', async ({ page }) => {
  await page.route('**/process/salamander1.mp4*', function respondWithJobId(route) {
    route.fulfill({ json: { jobId: 'replay-job' } });
  });
  await mockDoneJob(page);

  await page.goto('/preview/salamander1.mp4');
  await page.getByRole('button', { name: /process video/i }).click();
  await page.getByRole('link', { name: /watch trail replay/i }).click();

  await expect(page).toHaveURL(/\/replay\/salamander1\.mp4\/replay-job$/);
  await expect(page.getByText('Tracking glitches')).toBeVisible();
});

test('a recent job opens its trail replay from the video chooser', async ({ page }) => {
  await mockDoneJob(page);
  await page.route('**/api/videos', function respondWithVideoList(route) {
    route.fulfill({ json: ['salamander1.mp4'] });
  });
  await page.addInitScript(function seedRecentJobs() {
    window.localStorage.setItem(
      'centroidFinder.recentJobs',
      JSON.stringify([
        { filename: 'salamander1.mp4', jobId: 'replay-job', targetColorHex: '4F080B', threshold: 60, startedAt: new Date().toISOString() },
      ]),
    );
  });

  await page.goto('/videos');
  await page.getByRole('button', { name: /watch trail replay for salamander1\.mp4/i }).click();

  await expect(page).toHaveURL(/\/replay\/salamander1\.mp4\/replay-job$/);
});

test('explains when the job is still processing', async ({ page }) => {
  await page.route('**/process/replay-job/status', function respondWithProcessingStatus(route) {
    route.fulfill({ json: { status: 'processing' } });
  });

  await page.goto('/replay/salamander1.mp4/replay-job');

  await expect(page.getByText(/still processing/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /check again/i })).toBeVisible();
});

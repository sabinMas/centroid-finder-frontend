// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { test, expect } from '@playwright/test';

test('redirects / to /videos', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/videos$/);
});

// TODO(onjamm-dev): once VideoChooser renders the mock video list, add tests that
// the list renders an entry per mock video and that clicking one navigates to
// /preview/:filename.

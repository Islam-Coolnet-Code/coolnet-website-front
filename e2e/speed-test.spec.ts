import { test, expect } from '@playwright/test';

test.describe('Speed Test Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/speed-test');
  });

  test('should display speed test page', async ({ page }) => {
    // Check page title/header
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display built-in speed test section', async ({ page }) => {
    // Check for the built-in speed test UI
    const startButton = page.locator('button:has-text("Start")').or(
      page.locator('button:has-text("بدء")').or(
        page.locator('button:has-text("התחל")')
      )
    );

    await expect(startButton.first()).toBeVisible();
  });

  test('should display speed test results placeholders', async ({ page }) => {
    // Check for result display areas
    const latencyDisplay = page.locator('text=Latency').or(
      page.locator('text=زمن الاستجابة').or(
        page.locator('text=השהיה')
      )
    );

    const downloadDisplay = page.locator('text=Download').or(
      page.locator('text=التحميل').or(
        page.locator('text=הורדה')
      )
    );

    const uploadDisplay = page.locator('text=Upload').or(
      page.locator('text=الرفع').or(
        page.locator('text=העלאה')
      )
    );

    // At least one should be visible
    const hasResults = await latencyDisplay.count() > 0 ||
      await downloadDisplay.count() > 0 ||
      await uploadDisplay.count() > 0;

    expect(hasResults).toBeTruthy();
  });

  test('should display alternative speed test options', async ({ page }) => {
    // Check for external speed test links
    const fastLink = page.locator('a[href*="fast.com"]').or(
      page.locator('text=Fast.com')
    );

    const speedtestLink = page.locator('a[href*="speedtest.net"]').or(
      page.locator('text=Speedtest')
    );

    // At least one alternative should be present
    expect(await fastLink.count() > 0 || await speedtestLink.count() > 0).toBeTruthy();
  });

  test('should start speed test when button clicked', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start")').or(
      page.locator('button:has-text("بدء")').or(
        page.locator('button:has-text("התחל")')
      )
    );

    if (await startButton.count() > 0) {
      await startButton.first().click();

      // After clicking, should show stop button or progress
      const stopButton = page.locator('button:has-text("Stop")').or(
        page.locator('button:has-text("إيقاف")').or(
          page.locator('button:has-text("עצור")')
        )
      );

      // Either stop button appears or we see some progress indication
      await expect(stopButton.first().or(page.locator('[role="progressbar"]'))).toBeVisible({ timeout: 5000 });
    }
  });
});

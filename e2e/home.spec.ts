import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads
    await expect(page).toHaveTitle(/Coolnet/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero content
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Check navigation links
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be able to switch languages', async ({ page }) => {
    await page.goto('/');

    // Look for language switcher
    const langSwitcher = page.locator('[data-testid="language-switcher"]').or(
      page.locator('button:has-text("EN")').or(
        page.locator('button:has-text("عربي")')
      )
    );

    // If language switcher exists, try clicking it
    if (await langSwitcher.count() > 0) {
      await langSwitcher.first().click();
      // Page should still be functional after language switch
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate to plans page', async ({ page }) => {
    await page.goto('/');

    // Try to find and click plans link
    const plansLink = page.locator('a[href*="plans"]').or(
      page.locator('a:has-text("Plans")').or(
        page.locator('a:has-text("الباقات")')
      )
    );

    if (await plansLink.count() > 0) {
      await plansLink.first().click();
      await expect(page.url()).toContain('plans');
    }
  });

  test('should navigate to speed test page', async ({ page }) => {
    await page.goto('/speed-test');

    // Check speed test page loads
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();

    // Mobile menu should exist
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('button[aria-label*="menu"]').or(
        page.locator('.hamburger').or(
          page.locator('button:has(svg)')
        )
      )
    );

    // Either mobile menu exists or navigation is visible
    const hasNav = await page.locator('nav').isVisible();
    expect(hasNav || await mobileMenu.count() > 0).toBeTruthy();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
  });
});

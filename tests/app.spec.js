import { test, expect } from '@playwright/test';

test.describe('Carbon Emission Tracker Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the Carbon Emission Tracker headline', async ({ page }) => {
    await expect(page.locator('text=Carbon Emission Tracker')).toBeVisible();
  });

  test('toggles theme', async ({ page }) => {
    await page.click('text=Toggle Theme');
    await expect(page.locator('body')).toHaveClass('dark');
    await page.click('text=Toggle Theme');
    await expect(page.locator('body')).toHaveClass('light');
  });

  test('shows login form', async ({ page }) => {
    await page.click('text=Already have an account? Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('logs in and adds data', async ({ page }) => {
    await page.click('text=Already have an account? Login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('text=Login');

    await page.waitForTimeout(3000);

    await page.fill('placeholder=Enter carbon emission data', '123');
    await page.click('text=Add Data');
    await expect(page.locator('text=123')).toBeVisible();
  });
});
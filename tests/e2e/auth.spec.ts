import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Login & Register', () => {
  test('should show login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('text=Anmelden')).toBeVisible();
  });

  test('should show register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('text=Registrieren')).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@nephroassist.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Willkommen zurück')).toBeVisible();
  });
});

test.describe('Dashboard - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'admin@nephroassist.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should show dashboard stats', async ({ page }) => {
    await expect(page.locator('text=Patienten')).toBeVisible();
    await expect(page.locator('text=Termine')).toBeVisible();
    await expect(page.locator('text=Aufgaben')).toBeVisible();
    await expect(page.locator('text=Blocker')).toBeVisible();
  });

  test('should show patients list', async ({ page }) => {
    await expect(page.locator('text=Hans Müller')).toBeVisible();
    await expect(page.locator('text=Maria Schmidt')).toBeVisible();
    await expect(page.locator('text=Peter Weber')).toBeVisible();
  });

  test('should show notifications', async ({ page }) => {
    await expect(page.locator('text=Benachrichtigungen')).toBeVisible();
  });
});

test.describe('Dashboard - Patient', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'patient@beispiel.de');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('should show patient view', async ({ page }) => {
    await expect(page.locator('text=Patienten')).not.toBeVisible();
    await expect(page.locator('text=Termine')).toBeVisible(); // Kalender-Tab sollte sichtbar sein
  });
});

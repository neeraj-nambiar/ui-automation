import { Page, expect } from '@playwright/test';
import type { UserCredentials } from '../models/User';

/**
 * Authentication helper functions
 */

/**
 * Logs in a user with email and password
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: false }).fill(email);
  await page.getByLabel('Password', { exact: false }).fill(password);
  await page.getByRole('button', { name: /log in|sign in|submit/i }).click();
  await page.waitForURL(/.*dashboard|.*home/i);
}

/**
 * Logs in using credentials object
 * @param page - Playwright page object
 * @param credentials - User credentials
 */
export async function loginWithCredentials(page: Page, credentials: UserCredentials): Promise<void> {
  await login(page, credentials.email, credentials.password);
}

/**
 * Logs out the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: /user menu|account/i }).click();
  await page.getByRole('button', { name: /log ?out/i }).click();
  await expect(page).toHaveURL(/.*login/i);
}

/**
 * Checks if user is logged in
 * @param page - Playwright page object
 * @returns True if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.locator('[data-testid="user-menu"]').waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Logs in and stores authentication state
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 * @param storageStatePath - Path to save auth state
 */
export async function loginAndSaveState(
  page: Page,
  email: string,
  password: string,
  storageStatePath: string
): Promise<void> {
  await login(page, email, password);
  await page.context().storageState({ path: storageStatePath });
}

/**
 * Verify user is on login page
 * @param page - Playwright page object
 */
export async function expectOnLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/.*login/i);
  await expect(page.getByLabel('Email', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: false })).toBeVisible();
}

/**
 * Verify user is on dashboard/home page
 * @param page - Playwright page object
 */
export async function expectOnDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL(/.*dashboard|.*home/i);
}




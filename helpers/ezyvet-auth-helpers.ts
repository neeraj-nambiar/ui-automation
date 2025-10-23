import { Page, expect } from '@playwright/test';
import { EzyVetLoginPage } from '../pages/EzyVetLoginPage';

/**
 * ezyVet-specific authentication helper functions
 */

/**
 * Logs in to ezyVet with email, password, and department
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 * @param department - Department name (optional)
 */
export async function ezyVetLogin(
  page: Page, 
  email: string, 
  password: string, 
  department?: string
): Promise<void> {
  const loginPage = new EzyVetLoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password, department);
  await loginPage.expectLoginSuccess();
}

/**
 * Logs in to ezyVet using environment variables
 * @param page - Playwright page object
 */
export async function ezyVetLoginWithEnv(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL!;
  const password = process.env.TEST_USER_PASSWORD!;
  const department = process.env.TEST_DEPARTMENT;
  
  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file');
  }
  
  await ezyVetLogin(page, email, password, department);
}

/**
 * Logs out from ezyVet
 * @param page - Playwright page object
 */
export async function ezyVetLogout(page: Page): Promise<void> {
  // Look for user menu or logout button
  // Adjust selectors based on actual ezyVet implementation
  try {
    // Try common patterns for user menu
    const userMenuSelectors = [
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      '[data-testid="logout"]',
      '.user-menu button',
      '#user-menu',
      'button[aria-label="User menu"]',
    ];
    
    let logoutClicked = false;
    
    for (const selector of userMenuSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          logoutClicked = true;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!logoutClicked) {
      console.warn('Logout button not found, trying alternative methods');
      // Try to navigate to logout URL directly
      await page.goto('/logout');
    }
    
    // Wait for redirect to login page
    await page.waitForURL(/login|signin/, { timeout: 10000 }).catch(() => {
      console.log('Did not redirect to login page after logout');
    });
    
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
}

/**
 * Checks if user is logged in to ezyVet
 * @param page - Playwright page object
 * @returns True if user is logged in
 */
export async function isEzyVetLoggedIn(page: Page): Promise<boolean> {
  try {
    const currentUrl = page.url();
    
    // If on login page, definitely not logged in
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      return false;
    }
    
    // Look for common indicators of being logged in
    const loggedInSelectors = [
      '[data-testid="user-menu"]',
      '.user-menu',
      'button:has-text("Logout")',
      '#user-info',
      '.logged-in-indicator',
    ];
    
    for (const selector of loggedInSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Verify user is on ezyVet login page
 * @param page - Playwright page object
 */
export async function expectOnEzyVetLoginPage(page: Page): Promise<void> {
  const loginPage = new EzyVetLoginPage(page);
  await loginPage.expectOnLoginPage();
}

/**
 * Save authentication state for reuse
 * @param page - Playwright page object
 * @param statePath - Path to save authentication state
 */
export async function saveEzyVetAuthState(page: Page, statePath: string = 'auth-state.json'): Promise<void> {
  await page.context().storageState({ path: statePath });
}

/**
 * Complete login flow with error handling and retries
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 * @param department - Department name
 * @param maxRetries - Maximum number of retry attempts
 */
export async function ezyVetLoginWithRetry(
  page: Page,
  email: string,
  password: string,
  department?: string,
  maxRetries: number = 2
): Promise<void> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Login attempt ${attempt}/${maxRetries}`);
      await ezyVetLogin(page, email, password, department);
      console.log('Login successful');
      return;
    } catch (error) {
      lastError = error as Error;
      console.log(`Login attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        console.log('Retrying login...');
        await page.waitForTimeout(2000); // Wait before retry
      }
    }
  }
  
  throw new Error(`Login failed after ${maxRetries} attempts: ${lastError?.message}`);
}




import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ezyVetLogin } from '../helpers/ezyvet-auth-helpers';

/**
 * ezyVet Authenticated User Fixture
 * Provides a pre-authenticated page to tests for ezyVet
 * This can be reused across all tests that require authentication
 */

type EzyVetAuthenticatedFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<EzyVetAuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before test
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;
    const department = process.env.TEST_DEPARTMENT;
    
    if (!email || !password) {
      throw new Error(
        'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file'
      );
    }
    
    console.log('Setting up authenticated session for ezyVet...');
    
    try {
      await ezyVetLogin(page, email, password, department);
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
    
    // Verify login success
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('login');
    
    // Provide authenticated page to test
    await use(page);
    
    // Teardown: Optionally logout after test
    // Commented out to speed up tests - each test gets fresh context anyway
    // await ezyVetLogout(page).catch(() => {
    //   console.log('Logout skipped or failed');
    // });
  },
});

export { expect };




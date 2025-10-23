import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { login, logout } from '../helpers/auth-helpers';

/**
 * Authenticated user fixture
 * Provides a pre-authenticated page to tests
 */

type AuthenticatedFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before test
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;
    
    if (!email || !password) {
      throw new Error(
        'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file'
      );
    }
    
    await login(page, email, password);
    
    // Verify login success
    await expect(page).toHaveURL(/.*dashboard|.*home/i);
    
    // Provide authenticated page to test
    await use(page);
    
    // Teardown: Logout after test (optional - commented out to speed up tests)
    // await logout(page);
  },
});

export { expect };




import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { login } from '../helpers/auth-helpers';

/**
 * Custom test fixtures for the ezyVet test suite
 */

type TestFixtures = {
  // Add your custom fixtures here
};

/**
 * Extend base test with custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // Example fixture - uncomment and modify as needed
  /*
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before test
    await login(
      page,
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    
    // Provide authenticated page to test
    await use(page);
    
    // Teardown: Logout after test (optional)
    // await logout(page);
  },
  */
});

export { expect };




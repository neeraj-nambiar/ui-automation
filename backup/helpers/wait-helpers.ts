import { Page, Locator } from '@playwright/test';

/**
 * Custom wait helper functions
 */

/**
 * Waits for network to be idle
 * @param page - Playwright page object
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Waits for an element to be stable (not animating)
 * @param locator - Element locator
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForStable(locator: Locator, timeout: number = 3000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  // Wait a bit more for animations to complete
  await locator.page().waitForTimeout(300);
}

/**
 * Waits for API call to complete
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to wait for
 * @param timeout - Optional timeout in milliseconds
 * @returns Response object
 */
export async function waitForApiCall(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Waits for specific API response status
 * @param page - Playwright page object
 * @param urlPattern - URL pattern to wait for
 * @param status - Expected HTTP status code
 * @param timeout - Optional timeout in milliseconds
 * @returns Response object
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  status: number,
  timeout: number = 10000
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      const matchesUrl = typeof urlPattern === 'string' 
        ? url.includes(urlPattern) 
        : urlPattern.test(url);
      return matchesUrl && response.status() === status;
    },
    { timeout }
  );
}

/**
 * Retries an action until it succeeds or timeout
 * @param action - Async function to retry
 * @param maxAttempts - Maximum number of attempts
 * @param delayMs - Delay between attempts in milliseconds
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw new Error(`Action failed after ${maxAttempts} attempts: ${lastError!.message}`);
}

/**
 * Waits for element count to match expected value
 * @param locator - Element locator
 * @param expectedCount - Expected number of elements
 * @param timeout - Optional timeout in milliseconds
 */
export async function waitForElementCount(
  locator: Locator,
  expectedCount: number,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const count = await locator.count();
    if (count === expectedCount) {
      return;
    }
    await locator.page().waitForTimeout(100);
  }
  
  throw new Error(
    `Element count did not match expected ${expectedCount} within ${timeout}ms`
  );
}

/**
 * Waits for page to fully load (DOM + network)
 * @param page - Playwright page object
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

/**
 * Waits for a condition to be true
 * @param condition - Function that returns boolean or Promise<boolean>
 * @param timeout - Optional timeout in milliseconds
 * @param pollInterval - Optional polling interval in milliseconds
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  pollInterval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}




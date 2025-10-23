import { expect, Locator, Page } from '@playwright/test';

/**
 * Performs a search in the left sidebar search input
 * @param page - The Playwright page object
 * @param searchString - The text to search for
 * @throws Will throw an error if the search input is not found
 */
export const searchInSidebar = async (
  page: Page,
  searchString: string
): Promise<void> => {
  const searchInput = page
    .locator('#leftpane')
    .locator('input[placeholder*="search" i]');
  await searchInput.clear();
  await searchInput.fill(searchString);
  await searchInput.press('Enter');
};

/**
 * Waits for a search result to appear in the filter list
 * @param page - The Playwright page object
 * @param searchString - The text or regex pattern to look for in results
 * @throws Will throw an error if the search result doesn't appear within 5 seconds
 */
export const searchResultAppears = async (
  page: Page,
  searchString: string | RegExp
): Promise<void> => {
  await expect(page.locator('#filterlist li').first()).toHaveText(
    searchString,
    {
      timeout: 5000,
    }
  );
};

/**
 * Selects a search item from the filter list by clicking on it
 * @param page - The Playwright page object
 * @param searchString - The text to look for in the search results
 * @throws Will throw an error if the search item is not found or cannot be clicked
 */
export const selectSearchItem = async (
  page: Page,
  searchString: string
): Promise<void> => {
  await page
    .locator('#filterlist')
    .getByText(new RegExp(`${searchString}`))
    .click();
};

/**
 * Types into a search input field and waits for autocomplete/search resolution
 * Useful for dropdowns and autocomplete fields that set a title attribute when resolved
 * Currently supports single-match scenarios only
 * @param locator - The Playwright locator for the input field
 * @param searchString - The text to type into the field
 * @param expectedString - Optional expected value for verification (defaults to searchString)
 * @throws Will throw an error if the field doesn't resolve within 5 seconds
 * @todo Add support for selecting from search lists when multiple matches exist
 */
export const useSearchInput = async (
  locator: Locator,
  searchString: string,
  expectedString?: string | RegExp
): Promise<void> => {
  await locator.pressSequentially(searchString, { delay: 50 });
  // Wait for the title to be set - this happens when the search has resolved and found exactly one match
  // TODO add support for selecting from the search list if there are multiple matches
  await expect(locator).toHaveAttribute(
    'title',
    expectedString ?? searchString,
    {
      timeout: 5000,
    }
  );
};


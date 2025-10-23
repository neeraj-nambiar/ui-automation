import { expect, Locator, Page } from '@playwright/test';

/**
 * Navigates to the Animals (Patients) tab and waits for it to load
 */
export const navigateToAnimalsTab = async (page: Page) => {
  await page
    .getByRole('tab', {
      name: 'primary-tab-icon-animals',
    })
    .click();
  await expect(page.locator('.ezy\\:bg-background-ui')).toContainText('Patients');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Patient')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to the Contacts tab and waits for it to load
 */
export const navigateToContactsTab = async (page: Page) => {
  await page
    .getByRole('tab', {
      name: 'primary-tab-icon-contacts',
    })
    .click();
  await expect(page.locator('.ezy\\:bg-background-ui')).toContainText('Contacts');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Contact')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Performs a search in the left sidebar search input
 */
export const searchInSidebar = async (page: Page, searchString: string) => {
  const searchInput = page
    .locator('#leftpane')
    .locator('input[placeholder*="search" i]');
  await searchInput.clear();
  await searchInput.fill(searchString);
  await searchInput.press('Enter');
};

/**
 * Waits for a search result to appear in the filter list
 */
export const searchResultAppears = async (
  page: Page,
  searchString: string | RegExp
) => {
  await expect(page.locator('#filterlist li').first()).toHaveText(
    searchString,
    {
      timeout: 5000,
    }
  );
};

/**
 * Selects a search item from the filter list by clicking on it
 */
export const selectSearchItem = async (page: Page, searchString: string) => {
  // Dismiss any coverblock that might be blocking interactions
  const coverblock = page.locator('#coverblock, .coverBlock');
  const isBlockingVisible = await coverblock.isVisible().catch(() => false);
  if (isBlockingVisible) {
    await coverblock.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  
  await page
    .locator('#filterlist')
    .getByText(new RegExp(`${searchString}`))
    .click();
};

/**
 * Types into a search input field and waits for autocomplete/search resolution
 * Useful for dropdowns and autocomplete fields
 */
export const useSearchInput = async (
  locator: Locator,
  searchString: string,
  expectedString?: string | RegExp
) => {
  await locator.pressSequentially(searchString, { delay: 50 });
  // Wait for the title to be set - this happens when the search has resolved
  await expect(locator).toHaveAttribute(
    'title',
    expectedString ?? searchString,
    {
      timeout: 5000,
    }
  );
};


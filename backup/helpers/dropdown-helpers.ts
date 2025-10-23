import { Page } from '@playwright/test';

/**
 * Clicks on a dropdown icon to open the dropdown list
 * @param page - The Playwright page object
 * @param dropdownIdPrefix - The ID prefix to match (e.g., "clientcontactDropdown", "animalDropdown")
 * @throws Will throw an error if the dropdown icon is not found or cannot be clicked
 * @example
 * await clickDropdownIcon(page, "clientcontactDropdown");
 */
export const clickDropdownIcon = async (
  page: Page,
  dropdownIdPrefix: string
): Promise<void> => {
  await page
    .locator(`[id^="${dropdownIdPrefix}"] .icon`)
    .first()
    .click({ force: true });
  await page.waitForTimeout(1500);
};

/**
 * Selects the first item from a dropdown list
 * Supports multiple list container types (.sideList, .list, ul)
 * @param page - The Playwright page object
 * @param timeout - Optional timeout in milliseconds (defaults to 10000)
 * @throws Will throw an error if no list items are found within the timeout
 * @example
 * await selectFirstFromDropdownList(page);
 */
export const selectFirstFromDropdownList = async (
  page: Page,
  timeout: number = 10000
): Promise<void> => {
  await page
    .locator('.sideList li, .list li, ul li')
    .first()
    .click({ force: true, timeout });
  await page.waitForTimeout(1000);
};

/**
 * Selects a specific item from a dropdown list by text content
 * @param page - The Playwright page object
 * @param searchText - Text to search for in the list items
 * @param timeout - Optional timeout in milliseconds (defaults to 10000)
 * @throws Will throw an error if the item is not found within the timeout
 * @example
 * await selectFromDropdownListByText(page, "John Smith");
 */
export const selectFromDropdownListByText = async (
  page: Page,
  searchText: string,
  timeout: number = 10000
): Promise<void> => {
  await page
    .locator('.sideList li, .list li, ul li')
    .filter({ hasText: searchText })
    .first()
    .click({ force: true, timeout });
  await page.waitForTimeout(1000);
};

/**
 * Handles modal dismissal if a modal appears
 * Commonly used after dropdown selections that trigger confirmation modals
 * @param page - The Playwright page object
 * @param buttonTestId - The test ID of the button to click (defaults to "Cancel")
 * @returns Promise<boolean> - Returns true if modal was dismissed, false if no modal appeared
 * @example
 * const modalDismissed = await dismissModalIfPresent(page);
 */
export const dismissModalIfPresent = async (
  page: Page,
  buttonTestId: string = 'Cancel'
): Promise<boolean> => {
  const modalButton = page.getByTestId(buttonTestId);
  const modalVisible = await modalButton
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (modalVisible) {
    await modalButton.click();
    await page.waitForTimeout(1000);
    return true;
  }

  return false;
};

/**
 * Complete dropdown interaction: click icon, select first item, and handle modal if present
 * This is a convenience method that combines common dropdown operations
 * @param page - The Playwright page object
 * @param dropdownIdPrefix - The ID prefix to match (e.g., "clientcontactDropdown", "animalDropdown")
 * @param fieldName - Optional field name for logging purposes
 * @throws Will throw an error if any step fails
 * @example
 * await selectFirstFromDropdown(page, "clientcontactDropdown", "Client");
 */
export const selectFirstFromDropdown = async (
  page: Page,
  dropdownIdPrefix: string,
  fieldName?: string
): Promise<void> => {
  if (fieldName) {
    console.log(`📋 Selecting ${fieldName}...`);
  }

  // Click dropdown icon
  await clickDropdownIcon(page, dropdownIdPrefix);

  // Select first item
  await selectFirstFromDropdownList(page);

  // Handle modal if present
  const modalDismissed = await dismissModalIfPresent(page);
  if (modalDismissed && fieldName) {
    console.log(`✅ Modal dismissed after ${fieldName} selection`);
  }

  if (fieldName) {
    console.log(`✅ ${fieldName} selected`);
  }
};

/**
 * Complete dropdown interaction with specific text selection
 * @param page - The Playwright page object
 * @param dropdownIdPrefix - The ID prefix to match
 * @param searchText - Text to search for in the dropdown list
 * @param fieldName - Optional field name for logging purposes
 * @throws Will throw an error if any step fails
 * @example
 * await selectFromDropdownByText(page, "clientcontactDropdown", "Smith, John", "Client");
 */
export const selectFromDropdownByText = async (
  page: Page,
  dropdownIdPrefix: string,
  searchText: string,
  fieldName?: string
): Promise<void> => {
  if (fieldName) {
    console.log(`📋 Selecting ${fieldName}: ${searchText}...`);
  }

  // Click dropdown icon
  await clickDropdownIcon(page, dropdownIdPrefix);

  // Select specific item by text
  await selectFromDropdownListByText(page, searchText);

  // Handle modal if present
  const modalDismissed = await dismissModalIfPresent(page);
  if (modalDismissed && fieldName) {
    console.log(`✅ Modal dismissed after ${fieldName} selection`);
  }

  if (fieldName) {
    console.log(`✅ ${fieldName} selected: ${searchText}`);
  }
};


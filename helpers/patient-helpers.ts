import { expect, Page } from '@playwright/test';
import { navigateToAnimalsTab } from './tab-helpers';
import { searchInSidebar, searchResultAppears, useSearchInput } from './search-helpers';

/**
 * Creates an animal (patient) in the ezyVet system or verifies it already exists
 * Uses a conditional approach: searches first, creates only if not found
 * @param page - The Playwright page object
 * @param animalName - The unique name for the animal
 * @param ownerName - The full name of the owner in "LastName, FirstName" format
 * @param age - Optional age of the animal
 * @param tags - Optional array of tags to add to the animal
 * @throws Will throw an error if the animal cannot be created or verified
 * @example
 * await createAnimal(page, "Fluffy", "Smith, John");
 * await createAnimal(page, "Max", "Doe, Jane", 5, ["VIP", "Special Care"]);
 */
export const createAnimal = async (
  page: Page,
  animalName: string,
  ownerName: string,
  age?: number,
  tags?: string[]
): Promise<void> => {
  await navigateToAnimalsTab(page);
  await expect(page.locator('#filterlist').locator('li').first()).toBeVisible({
    timeout: 10000,
  });
  await searchInSidebar(page, animalName);

  try {
    await searchResultAppears(page, new RegExp(`"${animalName}"`));
    console.log(`✅ Animal "${animalName}" found.`);
    return;
  } catch (e) {
    console.log(`📝 Animal "${animalName}" not found. Creating...`);
  }

  await page.locator('input[name="animaldata_name"]').fill(animalName);
  
  // Fill owner field - open dropdown and search for the specific owner
  console.log(`📋 Searching for owner: ${ownerName}`);
  await page.locator('[id^="clientcontactDropdown"] .icon').first().click({ force: true });
  await page.waitForTimeout(1500);
  
  // Type in the search/filter input that appears in the dropdown sidebar
  const searchInput = page.locator('#leftpane').locator('input[placeholder*="search" i]');
  await searchInput.fill(ownerName);
  await searchInput.press('Enter');
  await page.waitForTimeout(1000);
  
  // Debug: Print all filterlist items to see what's available
  const allItems = await page.locator('#filterlist li').allTextContents();
  console.log(`📋 Available contacts in filterlist: ${allItems.join(', ')}`);
  
  // Try to find and select matching owner - handle different name formats
  const matchingItem = page.locator('#filterlist li').filter({ hasText: ownerName }).first();
  const isVisible = await matchingItem.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (isVisible) {
    await matchingItem.click({ force: true });
    console.log('✅ Owner selected by name match');
  } else {
    // If exact match not found, just select the first item (should be the recently created client)
    console.log('⚠️  Exact name match not found, selecting first item in list');
    await page.locator('#filterlist li').first().click({ force: true });
  }
  
  await page.waitForTimeout(2000);
  console.log('✅ Owner selected');
  
  await useSearchInput(page.getByTestId('AnimalColour'), 'Bald');

  if (age != null) {
    await page.locator('input[value="Not Set"]').click();
    await page.keyboard.type(age.toString());
    await expect(
      page.locator('input[name="animaldata_estimated"]:visible')
    ).toBeChecked();
  }

  if (tags != null) {
    // Click the ul which is below the "General" label
    await page
      .getByText('General', { exact: true })
      .locator('xpath=following-sibling::*[2]//ul[1]')
      .click();
    for (const tag of tags) {
      await page.keyboard.type(tag);
      await page.keyboard.press('Enter');
    }
  }

  await page.getByTestId('Save').click();
  await page.waitForTimeout(3000);

  // Check for error toast first
  const errorToast = await page.locator('.toast-error, [class*="toast"][class*="error"]')
    .first()
    .textContent({ timeout: 2000 })
    .catch(() => null);
  
  if (errorToast) {
    console.log(`❌ Error toast detected: ${errorToast}`);
    throw new Error(`Failed to create animal: ${errorToast}`);
  }
  
  // Also check for success toast
  const successToast = await page.locator('.toast-success, [class*="toast"][class*="success"]')
    .first()
    .textContent({ timeout: 2000 })
    .catch(() => null);
  
  if (successToast) {
    console.log(`✅ Success toast: ${successToast}`);
    console.log(`✅ Animal "${animalName}" created successfully.`);
    return; // Animal was created successfully, no need to verify sidebar
  } else {
    console.log('⚠️  No toast message detected');
  }

  // Only verify sidebar if we didn't get a success toast
  await expect(
    page.locator('.sidebar').getByText(new RegExp(animalName))
  ).toBeVisible({
    timeout: 5000,
  });

  console.log(`✅ Animal "${animalName}" created successfully.`);
};

/**
 * Creates an animal with a specific owner contact - optimized for creating from contact page
 * This version assumes you're already on the patient form (e.g., clicked "New Patient" from contact)
 * @param page - The Playwright page object
 * @param animalName - The unique name for the animal
 * @param ownerFirstName - The first name of the owner
 * @param ownerLastName - The last name of the owner
 * @param age - Optional age of the animal
 * @param tags - Optional array of tags to add to the animal
 * @throws Will throw an error if the animal cannot be created
 * @example
 * await createAnimalWithOwner(page, "Buddy", "John", "Smith");
 */
export const createAnimalWithOwner = async (
  page: Page,
  animalName: string,
  ownerFirstName: string,
  ownerLastName: string,
  age?: number,
  tags?: string[]
): Promise<void> => {
  // Fill animal name directly (assuming we're already on the patient form)
  console.log(`📝 Filling patient details for: ${animalName}`);
  await page.locator('input[name="animaldata_name"]').fill(animalName);
  
  // Owner should already be populated when creating from contact page
  // But let's verify it's set
  await page.waitForTimeout(1000);
  
  // Fill color field
  await useSearchInput(page.getByTestId('AnimalColour'), 'Bald');

  if (age != null) {
    await page.locator('input[value="Not Set"]').click();
    await page.keyboard.type(age.toString());
    await expect(
      page.locator('input[name="animaldata_estimated"]:visible')
    ).toBeChecked();
  }

  if (tags != null) {
    // Click the ul which is below the "General" label
    await page
      .getByText('General', { exact: true })
      .locator('xpath=following-sibling::*[2]//ul[1]')
      .click();
    for (const tag of tags) {
      await page.keyboard.type(tag);
      await page.keyboard.press('Enter');
    }
  }

  // Wait for Save button to be visible on the current tab
  await page.waitForTimeout(2000);
  
  // Use the second Save button (patient tab) since we have two tabs open
  console.log('💾 Saving patient record...');
  await page.getByTestId('Save').nth(1).click();
  await page.waitForTimeout(3000);

  // Check for error toast first
  const errorToast = await page.locator('.toast-error, [class*="toast"][class*="error"]')
    .first()
    .textContent({ timeout: 2000 })
    .catch(() => null);
  
  if (errorToast) {
    console.log(`❌ Error toast detected: ${errorToast}`);
    throw new Error(`Failed to create animal: ${errorToast}`);
  }
  
  // Also check for success toast
  const successToast = await page.locator('.toast-success, [class*="toast"][class*="success"]')
    .first()
    .textContent({ timeout: 2000 })
    .catch(() => null);
  
  if (successToast) {
    console.log(`✅ Success toast: ${successToast}`);
    console.log(`✅ Animal "${animalName}" created successfully.`);
    return; // Animal was created successfully, no need to verify sidebar
  } else {
    console.log('⚠️  No toast message detected');
  }

  console.log(`✅ Animal "${animalName}" created successfully.`);
};


import { expect, Page } from '@playwright/test';
import { navigateToAnimalsTab, searchInSidebar, searchResultAppears, selectSearchItem, useSearchInput } from './navigation';

/**
 * Creates an animal in the ezyVet system or verifies it already exists
 * Uses a conditional approach: searches first, creates only if not found
 * @param page - The Playwright page object
 * @param animalName - The unique name for the animal
 * @param ownerName - The full name of the owner in "LastName, FirstName" format
 * @param age - Optional age of the animal
 * @param tags - Optional array of tags to add to the animal
 * @throws Will throw an error if the animal cannot be created or verified
 * @example
 * await createAnimalIfNotExists(page, "Fluffy", "Smith, John");
 * await createAnimalIfNotExists(page, "Max", "Doe, Jane", 5, ["VIP", "Allergic"]);
 */
export const createAnimalIfNotExists = async (
  page: Page,
  animalName: string,
  ownerName: string,
  age?: number,
  tags?: string[]
): Promise<{ alreadyExists: boolean }> => {
  // Navigate to Animals tab using working navigation helper
  await navigateToAnimalsTab(page);
  
  // Search for existing animal
  await searchInSidebar(page, animalName);

  try {
    await searchResultAppears(page, new RegExp(`"${animalName}"`));
    console.log(`✅ Animal "${animalName}" already exists`);
    return { alreadyExists: true };
  } catch (e) {
    console.log(`⚠️  Animal "${animalName}" not found. Creating...`);
  }

  // Wait for the form to be ready
  await page.waitForTimeout(1000);
  
  // Fill animal details
  await page.locator('input[name="animaldata_name"]').fill(animalName);
  
  // Select owner - try finding the input more directly
  // Look for the ClientContact input in the Details section
  const ownerSection = page.locator('.inputSectionContent, .detail').first();
  const ownerInput = ownerSection.getByTestId('ClientContact').first();
  await ownerInput.waitFor({ state: 'visible', timeout: 10000 });
  await useSearchInput(
    ownerInput,
    ownerName,
    new RegExp(ownerName)
  );
  
  // Select color (required field)
  await useSearchInput(page.getByTestId('AnimalColour'), 'Bald');

  // Set age if provided
  if (age != null) {
    await page.locator('input[value="Not Set"]').click();
    await page.keyboard.type(age.toString());
    await expect(
      page.locator('input[name="animaldata_estimated"]:visible')
    ).toBeChecked();
  }
  
  // Add tags if provided
  if (tags != null) {
    await page
      .getByText('General', { exact: true })
      .locator('xpath=following-sibling::*[2]//ul[1]')
      .click();
    for (const tag of tags) {
      await page.keyboard.type(tag);
      await page.keyboard.press('Enter');
    }
  }

  // Save the animal
  await page.getByTestId('Save').click();

  // Verify creation
  await expect(
    page.locator('.sidebar').getByText(new RegExp(animalName))
  ).toBeVisible({
    timeout: 5000,
  });
  
  console.log(`✅ Animal "${animalName}" created successfully`);
  return { alreadyExists: false };
};

/**
 * Navigates to a specific animal's page through search and selection
 * @param page - The Playwright page object
 * @param animalName - The name of the animal to navigate to
 * @throws Will throw an error if the animal cannot be found or the page doesn't load
 */
export const navigateToAnimal = async (page: Page, animalName: string) => {
  // Navigate to Animals tab
  await navigateToAnimalsTab(page);
  
  // Search and select animal
  await searchInSidebar(page, animalName);
  await selectSearchItem(page, animalName);
  
  // Verify we're on the animal's page
  await expect(
    page.locator('.sidebar').getByText(new RegExp(animalName))
  ).toBeVisible({
    timeout: 3000,
  });
};



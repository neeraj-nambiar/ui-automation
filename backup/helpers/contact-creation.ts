import { expect, Page } from '@playwright/test';
import { navigateToContactsTab, searchInSidebar, searchResultAppears, selectSearchItem, useSearchInput } from './navigation';

export type ContactType =
  | 'Customer'
  | 'Supplier'
  | 'Vet'
  | 'Syndicate'
  | 'Staff Member'
  | 'Pharmacy';

export interface ContactName {
  firstName: string;
  lastName: string;
}

/**
 * Creates a customer contact in the ezyVet system or verifies it already exists
 * This is a convenience wrapper around createContact for creating customers specifically
 * @param page - The Playwright page object
 * @param customerName - Object containing firstName and lastName properties
 * @throws Will throw an error if the customer cannot be created or verified
 * @example
 * await createCustomerIfNotExists(page, { firstName: "John", lastName: "Smith" });
 */
export const createCustomerIfNotExists = async (
  page: Page,
  customerName: ContactName
) => {
  await createContact(page, customerName, 'Customer');
};

/**
 * Creates a contact in the ezyVet system or verifies it already exists
 * Uses a conditional approach: searches first, creates only if not found
 * @param page - The Playwright page object
 * @param contactName - Object containing firstName and lastName properties
 * @param contactType - Single contact type or array of contact types to assign
 * @throws Will throw an error if the contact cannot be created or verified
 * @example
 * await createContact(page, { firstName: "John", lastName: "Smith" }, "Customer");
 * await createContact(page, { firstName: "Dr. Jane", lastName: "Doe" }, ["Vet", "Customer"]);
 */
export const createContact = async (
  page: Page,
  contactName: ContactName,
  contactType: ContactType | ContactType[]
) => {
  // Navigate to Contacts tab using working navigation helper
  await navigateToContactsTab(page);
  
  // Search for existing contact
  await searchInSidebar(page, `${contactName.firstName} ${contactName.lastName}`);

  try {
    await searchResultAppears(
      page,
      new RegExp(`${contactName.lastName}, ${contactName.firstName}`)
    );
    console.log(`✅ Contact "${contactName.firstName} ${contactName.lastName}" already exists`);
    return;
  } catch (e) {
    console.log(`⚠️  Contact "${contactName.firstName} ${contactName.lastName}" not found. Creating...`);
  }

  // Prepare contact types array
  let contactTypeList: ContactType[] = [];
  if (!Array.isArray(contactType)) {
    contactTypeList.push(contactType);
  } else {
    contactTypeList = contactType;
  }
  
  // Customer is auto-checked, uncheck it to clear form
  await page.getByRole('checkbox', { name: 'Customer' }).click();

  // Check the required contact types
  for (const type of contactTypeList) {
    await page.getByRole('checkbox', { name: type }).click();
  }

  // Fill contact details
  await page.getByRole('textbox', { name: 'First Name' }).fill(contactName.firstName);
  await page.getByRole('textbox', { name: 'Last Name' }).fill(contactName.lastName);
  
  // Add email
  await page.locator('[id="EmailPhone[1][emailphonedata_content]"]').fill('test@test.com');
  
  // Select Email type from dropdown
  await useSearchInput(
    page.locator('.inputSectionContent').getByTestId('EmailPhoneType'),
    'Email'
  );

  // Save the contact
  await page.getByTestId('Save').click();

  // Verify creation
  await expect(
    page
      .locator('.sidebar')
      .getByText(new RegExp(`${contactName.lastName}, ${contactName.firstName}`))
  ).toBeVisible({
    timeout: 5000,
  });
  
  console.log(`✅ Contact "${contactName.firstName} ${contactName.lastName}" created successfully`);
};

/**
 * Navigates to a specific contact's page through search and selection
 * @param page - The Playwright page object
 * @param contactName - The contact name object or full name string
 */
export const navigateToContact = async (
  page: Page,
  contactName: ContactName | string
) => {
  const searchTerm = typeof contactName === 'string'
    ? contactName
    : `${contactName.firstName} ${contactName.lastName}`;
  
  // Navigate to Contacts tab
  await navigateToContactsTab(page);
  
  // Search and select contact
  await searchInSidebar(page, searchTerm);
  await selectSearchItem(page, searchTerm);
  
  // Verify we're on the contact's page
  await expect(
    page.locator('.sidebar').getByText(new RegExp(searchTerm))
  ).toBeVisible({
    timeout: 3000,
  });
};



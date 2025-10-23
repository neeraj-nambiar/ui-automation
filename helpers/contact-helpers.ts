import { expect, Page } from '@playwright/test';
import { navigateToContactsTab } from './tab-helpers';
import { searchInSidebar, searchResultAppears, useSearchInput } from './search-helpers';

type ContactType =
  | 'Customer'
  | 'Supplier'
  | 'Vet'
  | 'Syndicate'
  | 'Staff Member'
  | 'Pharmacy';

export type ContactName = {
  firstName: string;
  lastName: string;
};

/**
 * Creates a customer contact in the ezyVet system or verifies it already exists
 * This is a convenience wrapper around createContact for creating customers specifically
 * @param page - The Playwright page object
 * @param customerName - Object containing firstName and lastName properties
 * @throws Will throw an error if the customer cannot be created or verified
 * @example
 * await createCustomer(page, { firstName: "John", lastName: "Smith" });
 */
export const createCustomer = async (
  page: Page,
  customerName: ContactName
): Promise<void> => {
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
): Promise<void> => {
  await navigateToContactsTab(page);
  await expect(page.locator('#filterlist').locator('li').first()).toBeVisible({
    timeout: 10000,
  });
  await searchInSidebar(
    page,
    `${contactName.firstName} ${contactName.lastName}`
  );

  try {
    await searchResultAppears(
      page,
      new RegExp(`-  ${contactName.lastName}, ${contactName.firstName}`)
    );
    console.log(
      `✅ Contact "${contactName.firstName} ${contactName.lastName}" found.`
    );
    return;
  } catch (e) {
    console.log(
      `📝 Contact "${contactName.firstName} ${contactName.lastName}" not found. Creating...`
    );
  }

  let contactTypeList: ContactType[] = [];
  if (!Array.isArray(contactType)) {
    contactTypeList.push(contactType);
  } else {
    contactTypeList = contactType;
  }

  // Customer is auto-checked, uncheck it to clear form
  await page.getByRole('checkbox', { name: 'Customer' }).click();

  for (const type of contactTypeList) {
    await page.getByRole('checkbox', { name: type }).click();
  }

  await page
    .getByRole('textbox', { name: 'First Name' })
    .fill(contactName.firstName);
  await page
    .getByRole('textbox', { name: 'Last Name' })
    .fill(contactName.lastName);
  await page
    .locator('[id="EmailPhone[1][emailphonedata_content]"]')
    .fill('test@test.com');
  await useSearchInput(
    page.locator('.inputSectionContent').getByTestId('EmailPhoneType'),
    'Email'
  );

  await page.getByTestId('Save').click();

  await expect(
    page
      .locator('.sidebar')
      .getByText(
        new RegExp(`${contactName.lastName}, ${contactName.firstName}`)
      )
  ).toBeVisible({
    timeout: 3000,
  });

  console.log(
    `✅ Contact "${contactName.firstName} ${contactName.lastName}" created successfully.`
  );
};


import { expect, Page } from '@playwright/test';

type Tab =
  | 'Dashboard'
  | 'Contacts'
  | 'Patients'
  | 'Clinical'
  | 'Financial'
  | 'Reporting'
  | 'Admin'
  | 'Help';

type DashboardSubTab =
  | 'Calendar'
  | 'eBookings'
  | 'Records'
  | 'Boarding'
  | 'Communication'
  | 'Hospital'
  | 'Diagnostics'
  | 'Work List'
  | 'Medications'
  | 'Lost And Found'
  | 'Billing Triggers'
  | 'Time Clock'
  | 'Jobs'
  | 'Active Users'
  | 'Support Tools';

type ContactSubTab =
  | 'Details'
  | 'Related Records'
  | 'Financial'
  | 'S.O.C.'
  | 'Diagnostics'
  | 'Appointments'
  | 'Options'
  | 'Communication'
  | 'Memos'
  | 'Attachment'
  | 'Change Log'
  | 'Merge'
  | 'Support Tools';

type AnimalSubTab =
  | 'Details'
  | 'Clinical Records'
  | 'Master Problems'
  | 'S.O.C.'
  | 'Financial'
  | 'Dental'
  | 'Image Annotations'
  | 'Summaries'
  | 'Health Status'
  | 'Medication'
  | 'Vaccination'
  | 'Diagnostics'
  | 'Appointments'
  | 'Communication'
  | 'Memos'
  | 'Attachment'
  | 'Change Log'
  | 'Merge'
  | 'Support Tools';

/**
 * Navigates to the Animals (Patients) tab and waits for it to load
 * @param page - The Playwright page object
 * @throws Will throw an error if the tab doesn't load within 5 seconds
 */
export const navigateToAnimalsTab = async (page: Page): Promise<void> => {
  await navigateToTab(page, 'Patients');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Patient')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to the Dashboard tab and waits for it to load
 * @param page - The Playwright page object
 * @throws Will throw an error if the tab doesn't load within 5 seconds
 */
export const navigateToDashboardTab = async (page: Page): Promise<void> => {
  await navigateToTab(page, 'Dashboard');
  await expect(
    page.locator('.tabSliderHolder').getByText('Dashboard')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to the Contacts tab and waits for it to load
 * @param page - The Playwright page object
 * @throws Will throw an error if the tab doesn't load within 5 seconds
 */
export const navigateToContactsTab = async (page: Page): Promise<void> => {
  await navigateToTab(page, 'Contacts');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Contact')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to the Financial tab and waits for it to load
 * @param page - The Playwright page object
 * @throws Will throw an error if the tab doesn't load within 5 seconds
 */
export const navigateToFinancialTab = async (page: Page): Promise<void> => {
  await navigateToTab(page, 'Financial');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Invoice')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to the Admin tab and waits for it to load
 * @param page - The Playwright page object
 * @throws Will throw an error if the tab doesn't load within 5 seconds
 */
export const navigateToAdminTab = async (page: Page): Promise<void> => {
  await navigateToTab(page, 'Admin');
  await expect(
    page.locator('.tabSliderHolder').getByText('New Product')
  ).toBeVisible({ timeout: 5000 });
};

/**
 * Navigates to a specific main tab in the ezyVet application
 * @param page - The Playwright page object
 * @param tab - The main tab to navigate to
 * @throws Will throw an error if the tab cannot be clicked or doesn't activate
 */
const navigateToTab = async (page: Page, tab: Tab): Promise<void> => {
  await page
    .getByRole('tab', {
      name: `primary-tab-icon-${
        tab === 'Patients' ? 'animals' : tab.toLowerCase()
      }`,
    })
    .click();
  await expect(page.locator('.ezy\\:bg-background-ui')).toHaveText(tab);
};

/**
 * Navigates to a specific subtab within the currently active main tab
 * @param page - The Playwright page object
 * @param subTab - The subtab to navigate to (must be valid for the current main tab)
 * @throws Will throw an error if the subtab cannot be clicked or doesn't activate
 */
export const navigateToSubTab = async (
  page: Page,
  subTab: AnimalSubTab | DashboardSubTab | ContactSubTab
): Promise<void> => {
  const tabLocator = page.locator(`.subTab:has-text("${subTab}")`);
  await tabLocator.click();
  await expect(tabLocator).toContainClass('active');
};


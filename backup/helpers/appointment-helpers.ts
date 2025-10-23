import { Page } from '@playwright/test';
import { AnimalsPage } from '../pages/AnimalsPage';
import { AppointmentPage } from '../pages/AppointmentPage';

/**
 * Appointment Helper Functions
 * Reusable utilities for appointment-related test operations
 * 
 * Following functional helpers pattern from PLAYWRIGHT_BEST_PRACTICES.md
 */

/**
 * Navigate to patient record and open appointment form
 * Combines common steps for appointment creation
 * 
 * @param page - Playwright Page object
 * @param patientId - Patient ID to search for
 * @returns Object with page object instances
 */
export async function navigateToAppointmentForm(
  page: Page, 
  patientId: string
): Promise<{ animalsPage: AnimalsPage; appointmentPage: AppointmentPage }> {
  const animalsPage = new AnimalsPage(page);
  const appointmentPage = new AppointmentPage(page);
  
  // Navigate to Animals tab
  await animalsPage.navigateToAnimalsTab();
  
  // Search and select patient
  await animalsPage.searchAndSelectPatient(patientId);
  
  // Open appointment form
  await animalsPage.clickNewAppointment();
  await appointmentPage.waitForFormReady();
  
  return { animalsPage, appointmentPage };
}

/**
 * Quick appointment creation helper
 * Creates appointment with minimal required data
 * 
 * @param page - Playwright Page object
 * @param patientId - Patient ID
 * @param resourceName - Resource/Doctor name (e.g., "Dr Smith")
 */
export async function createQuickAppointment(
  page: Page,
  patientId: string,
  resourceName: string
): Promise<void> {
  const { appointmentPage } = await navigateToAppointmentForm(page, patientId);
  
  await appointmentPage.fillPeopleResources(resourceName);
  await appointmentPage.save();
  await appointmentPage.expectSaveSuccess();
}

/**
 * Create appointment with full details
 * 
 * @param page - Playwright Page object
 * @param patientId - Patient ID
 * @param appointmentDetails - Complete appointment details
 */
export async function createFullAppointment(
  page: Page,
  patientId: string,
  appointmentDetails: {
    resource: string;
    appointmentType?: string;
    date?: string;
    time?: string;
    notes?: string;
  }
): Promise<void> {
  const { appointmentPage } = await navigateToAppointmentForm(page, patientId);
  
  await appointmentPage.createFullAppointment(appointmentDetails);
  await appointmentPage.expectSaveSuccess();
}

/**
 * Search for a patient in Animals tab
 * Standalone helper for patient search
 * 
 * @param page - Playwright Page object
 * @param searchTerm - Patient ID or name
 */
export async function searchPatient(
  page: Page,
  searchTerm: string
): Promise<AnimalsPage> {
  const animalsPage = new AnimalsPage(page);
  
  await animalsPage.navigateToAnimalsTab();
  await animalsPage.searchAndSelectPatient(searchTerm);
  
  return animalsPage;
}

/**
 * Verify appointment success message
 * Reusable assertion helper
 * 
 * @param page - Playwright Page object
 * @param expectedMessage - Expected success message text (default: "Success")
 */
export async function verifyAppointmentSuccess(
  page: Page,
  expectedMessage: string = 'Success'
): Promise<void> {
  const appointmentPage = new AppointmentPage(page);
  await appointmentPage.expectSaveSuccess();
  
  // Additional verification
  const toast = page.locator('.toast-success, .alert-success, [class*="success"]');
  const messageText = await toast.textContent();
  
  if (messageText && !messageText.includes(expectedMessage)) {
    throw new Error(`Expected message to contain "${expectedMessage}", but got "${messageText}"`);
  }
}

/**
 * Cancel appointment creation and verify form closed
 * 
 * @param page - Playwright Page object
 */
export async function cancelAppointment(page: Page): Promise<void> {
  const appointmentPage = new AppointmentPage(page);
  await appointmentPage.cancel();
  
  // Verify form is no longer visible
  await page.waitForTimeout(1000);
}

/**
 * Wait for appointment form to be ready for interaction
 * 
 * @param page - Playwright Page object
 */
export async function waitForAppointmentForm(page: Page): Promise<AppointmentPage> {
  const appointmentPage = new AppointmentPage(page);
  await appointmentPage.waitForFormReady();
  return appointmentPage;
}


import { Page, Locator, expect } from '@playwright/test';

/**
 * ezyVet Appointment Page Object Model
 * Handles appointment creation and management interactions
 * 
 * ✅ VERIFIED flow from appointment_creation_success.md:
 * - Create appointment from patient record
 * - Fill mandatory "People/Resources Used" field
 * - Save and verify success message
 */
export class AppointmentPage {
  readonly page: Page;
  
  // Form field locators
  readonly peopleResourcesField: Locator;
  readonly appointmentTypeField: Locator;
  readonly dateField: Locator;
  readonly timeField: Locator;
  readonly statusField: Locator;
  readonly billingTriggerField: Locator;
  readonly notesField: Locator;
  
  // Action buttons
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  
  // Success/Error messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Form fields - Look for visible autocomplete inputs, not hidden fields
    // The People/Resources field uses an autocomplete with radio button selection
    // Look for the text input that appears after the radio button
    this.peopleResourcesField = page.locator('input.ui-autocomplete-input').first();
    this.appointmentTypeField = page.locator('input[type="text"]:visible').filter({ hasText: /appointment.*type/i }).or(page.locator('input[placeholder*="Appointment Type" i]:visible')).first();
    this.dateField = page.locator('input[type="date"]:visible, input[placeholder*="date" i]:visible').first();
    this.timeField = page.locator('input[type="time"]:visible, input[placeholder*="time" i]:visible').first();
    this.statusField = page.locator('select[name*="status" i]:visible, input[placeholder*="status" i]:visible').first();
    this.billingTriggerField = page.locator('input[placeholder*="Billing Trigger" i]:visible, select[name*="billing" i]:visible').first();
    this.notesField = page.locator('textarea[name*="note" i]:visible, textarea[placeholder*="note" i]:visible').first();
    
    // Buttons - The Save button (yellow) and Save & Close are both visible
    this.saveButton = page.getByText('Save', { exact: true }).first();
    this.cancelButton = page.getByRole('button', { name: /cancel|close/i });
    
    // Messages - Toast notifications
    this.successMessage = page.locator('.toast-success, .alert-success, [class*="success"]').getByText(/saved|success/i);
    this.errorMessage = page.locator('.toast-error, .alert-error, [class*="error"]').first();
  }

  /**
   * Fill the mandatory "People/Resources Used" field
   * ✅ VERIFIED: This is the only mandatory field for basic appointment
   * Uses the magnifier icon to open the selection dropdown
   * @param resourceName - Resource/Doctor name (e.g., "Dr Smith")
   */
  async fillPeopleResources(resourceName: string) {
    console.log(`Filling People/Resources with: ${resourceName}`);
    
    // Click the magnifier icon using the test ID found via Playwright codegen
    console.log('✅ Clicking magnifier icon next to People/Resources field');
    const magnifierIcon = this.page.getByTestId('Resource');
    await magnifierIcon.click();
    await this.page.waitForTimeout(500);
    
    // Type the resource name in the search field that appears
    console.log(`✅ Typing resource name: ${resourceName}`);
    const searchInput = this.page.locator('input[type="text"]:visible, input[type="search"]:visible').last();
    await searchInput.fill(resourceName);
    await this.page.waitForTimeout(500);
    
    // Click on the matching result from the dropdown
    console.log('✅ Selecting resource from dropdown');
    const resultOption = this.page.getByText(resourceName, { exact: false }).first();
    await resultOption.click();
    await this.page.waitForTimeout(500);
    
    console.log('✅ People/Resources field filled successfully');
  }

  /**
   * Fill appointment type (optional)
   * @param appointmentType - Type name (e.g., "Consult")
   */
  async fillAppointmentType(appointmentType: string) {
    await this.appointmentTypeField.click();
    await this.appointmentTypeField.fill(appointmentType);
    await this.page.waitForTimeout(500);
    
    // Try to select from dropdown
    const dropdown = this.page.getByText(appointmentType, { exact: false }).first();
    const isVisible = await dropdown.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await dropdown.click();
    }
  }

  /**
   * Fill appointment date (optional)
   * @param date - Date in format YYYY-MM-DD or DD/MM/YYYY
   */
  async fillDate(date: string) {
    await this.dateField.fill(date);
  }

  /**
   * Fill appointment time (optional)
   * @param time - Time in format HH:MM
   */
  async fillTime(time: string) {
    await this.timeField.fill(time);
  }

  /**
   * Add notes to the appointment (optional)
   * @param notes - Appointment notes
   */
  async fillNotes(notes: string) {
    await this.notesField.fill(notes);
  }

  /**
   * Save the appointment
   * ✅ VERIFIED: Triggers "Record Saved Successfully!" message
   * Uses Ctrl+Enter keyboard shortcut or clicks Save button at top of page
   */
  async save() {
    console.log('✅ Saving appointment using Ctrl+Enter');
    
    // Method 1: Use keyboard shortcut Ctrl+Enter to save
    await this.page.keyboard.press('Control+Enter');
    await this.page.waitForTimeout(1500);
    
    // Check if save was successful by looking for success message
    const successAppeared = await this.successMessage.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (!successAppeared) {
      // Method 2: Fallback to clicking the Save button at top of page
      console.log('⚠️  Ctrl+Enter didn\'t work, clicking Save button');
      const saveButton = this.page.getByTestId('Save').first();  // Click the first Save button
      await saveButton.click({ force: true });  // Force click even if not visible
      await this.page.waitForTimeout(1500);
    }
    
    console.log('⏳ Waiting for save operation to complete...');
    // Wait for save operation to complete (with timeout to avoid hanging)
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('⚠️  Network didn\'t go idle, but continuing...');
    });
  }

  /**
   * Cancel appointment creation
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Complete appointment creation with minimal required data
   * ✅ VERIFIED flow from appointment_creation_success.md
   * @param resourceName - Doctor/Resource name (mandatory)
   */
  async createBasicAppointment(resourceName: string) {
    await this.fillPeopleResources(resourceName);
    await this.save();
  }

  /**
   * Complete appointment creation with full details
   * @param appointmentData - Object containing appointment details
   */
  async createFullAppointment(appointmentData: {
    resource: string;
    appointmentType?: string;
    date?: string;
    time?: string;
    notes?: string;
  }) {
    // Fill mandatory field
    await this.fillPeopleResources(appointmentData.resource);
    
    // Fill optional fields if provided
    if (appointmentData.appointmentType) {
      await this.fillAppointmentType(appointmentData.appointmentType);
    }
    
    if (appointmentData.date) {
      await this.fillDate(appointmentData.date);
    }
    
    if (appointmentData.time) {
      await this.fillTime(appointmentData.time);
    }
    
    if (appointmentData.notes) {
      await this.fillNotes(appointmentData.notes);
    }
    
    // Save
    await this.save();
  }

  // Assertions

  /**
   * Expect appointment form to be visible
   */
  async expectAppointmentFormVisible() {
    // Check if appointment details heading is visible
    await expect(this.page.getByText('Appointment Details')).toBeVisible({ timeout: 10000 });
  }

  /**
   * Expect success message after saving
   * ✅ VERIFIED: "Record Saved Successfully!" toast appears
   */
  async expectSaveSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    
    // Verify the specific success message text
    const messageText = await this.successMessage.textContent();
    expect(messageText).toContain('Success');
  }

  /**
   * Expect error message
   */
  async expectSaveError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Expect specific field to be visible
   */
  async expectFieldVisible(fieldLocator: Locator) {
    await expect(fieldLocator).toBeVisible();
  }

  /**
   * Wait for form to be ready for input
   */
  async waitForFormReady() {
    await this.page.waitForLoadState('networkidle');
    await this.expectAppointmentFormVisible();
  }
}


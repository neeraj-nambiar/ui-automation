import { Page, Locator, expect } from '@playwright/test';

/**
 * ezyVet Animals Page Object Model
 * Handles interactions with the Animals/Patients section
 * 
 * Based on verified appointment creation flow
 * @see appointment_creation_success.md
 */
export class AnimalsPage {
  readonly page: Page;
  
  // Locators
  readonly animalsTab: Locator;
  readonly searchInput: Locator;
  readonly newAppointmentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Tab navigation - Animals tab is an icon-based tab in the header
    this.animalsTab = page.getByRole('tab', { name: /animals/i });
    
    // Search functionality
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    // Action buttons - Use the enabled button (not the disabled one)
    this.newAppointmentButton = page.getByTestId('NewAppointment');
  }

  /**
   * Navigate to Animals tab from dashboard
   */
  async navigateToAnimalsTab() {
    await this.animalsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for and select a patient by ID or name
   * @param searchTerm - Patient ID or name (e.g., "201854" or "1=1 Lomu")
   */
  async searchAndSelectPatient(searchTerm: string) {
    // Wait for the page to be ready
    await this.page.waitForLoadState('networkidle');
    
    // Search for the patient
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(1000); // Allow search to complete
    
    // Click on the patient record in search results
    await this.page.getByText(searchTerm, { exact: false }).first().click();
    
    // Wait for patient record to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select a random animal from the visible list
   * This provides better test coverage by testing with different patients
   * @returns The selected animal's information (ID and name)
   */
  async selectRandomAnimal(): Promise<{ id: string; name: string }> {
    // Wait for the animals list to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    // Find all animal rows in the list
    // Animals are typically displayed in a list with their ID and name
    const animalRows = this.page.locator('[class*="animal"], [class*="patient"], tr:has-text("Active")').filter({
      hasText: /\d{6}/  // Filter for rows that contain a 6-digit ID
    });
    
    // Wait for at least one animal to be visible
    await animalRows.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Get count of visible animals
    const count = await animalRows.count();
    
    if (count === 0) {
      throw new Error('No animals found in the list');
    }
    
    // Select a random index
    const randomIndex = Math.floor(Math.random() * Math.min(count, 10)); // Limit to first 10 for performance
    
    // Get the random animal row
    const selectedRow = animalRows.nth(randomIndex);
    
    // Extract the animal information before clicking
    const animalText = await selectedRow.textContent();
    const animalInfo = {
      id: animalText?.match(/\d{6}/)?.[0] || 'Unknown ID',
      name: animalText?.split('-')[1]?.trim() || 'Unknown Name'
    };
    
    console.log(`Selecting random animal #${randomIndex + 1}/${count}: ${animalInfo.id} - ${animalInfo.name}`);
    
    // Click on the selected animal
    await selectedRow.click();
    
    // Wait for animal record to load
    await this.page.waitForLoadState('networkidle');
    
    return animalInfo;
  }

  /**
   * Select a random animal from search results
   * More targeted approach - searches first, then selects random from results
   * @param searchTerm - Optional search term to filter animals (e.g., "Active" or partial name)
   * @returns The selected animal's information
   */
  async searchAndSelectRandomAnimal(searchTerm: string = ''): Promise<{ id: string; name: string }> {
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    
    // Perform search if search term provided
    if (searchTerm) {
      await this.searchInput.fill(searchTerm);
      await this.page.waitForTimeout(1000);
    }
    
    // Select random from results
    return await this.selectRandomAnimal();
  }

  /**
   * Click "New Appointment" button from patient record
   * ✅ VERIFIED: Opens appointment creation form
   */
  async clickNewAppointment() {
    await this.newAppointmentButton.click();
    
    // Wait for appointment form to appear
    await this.page.waitForLoadState('networkidle');
    
    // Handle "Found Recent Consult" modal if it appears
    await this.handleRecentConsultModal();
  }

  /**
   * Handle the "Found Recent Consult" modal that may appear
   * Offers to link appointment to existing consult
   * ✅ Clicks "Cancel" to proceed without linking to existing consult
   */
  async handleRecentConsultModal() {
    // Wait a bit for modal to fully appear if it's going to
    await this.page.waitForTimeout(1000);
    
    // Check if the modal appears - look for the modal heading
    const modalHeading = this.page.getByText('Found Recent Consult');
    const isVisible = await modalHeading.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      console.log('✅ Found Recent Consult modal detected - clicking Cancel button');
      
      // Click the enabled Cancel button using test ID (not the disabled one)
      const cancelButton = this.page.getByTestId('Cancel');
      await cancelButton.click();
      
      // Wait for modal to disappear completely
      await this.page.waitForTimeout(1500);
      
      // Verify modal is gone
      const stillVisible = await modalHeading.isVisible({ timeout: 1000 }).catch(() => false);
      if (stillVisible) {
        console.warn('⚠️  Modal still visible after clicking Cancel, trying again...');
        await this.page.getByText('Cancel').click();
        await this.page.waitForTimeout(1000);
      } else {
        console.log('✅ Modal dismissed successfully');
      }
    }
  }

  // Assertions

  /**
   * Expect to be on Animals page/tab
   */
  async expectOnAnimalsPage() {
    await expect(this.animalsTab).toBeVisible();
  }

  /**
   * Expect patient record to be displayed
   * @param patientIdentifier - Patient ID or name to verify
   */
  async expectPatientRecordVisible(patientIdentifier: string) {
    await expect(this.page.getByText(patientIdentifier, { exact: false })).toBeVisible();
  }
}


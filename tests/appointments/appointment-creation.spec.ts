import { test, expect } from '@playwright/test';
import { ezyVetLoginWithEnv } from '../../helpers/ezyvet-auth-helpers';
import { createCustomer } from '../../helpers/contact-helpers';
import { createAnimalWithOwner } from '../../helpers/patient-helpers';
import { useSearchInput } from '../../helpers/search-helpers';

test.describe('ezyVet Appointment Creation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login using existing helper that reads from env variables
    await ezyVetLoginWithEnv(page);
    await page.waitForTimeout(2000);
    
    console.log('✅ Logged in and landed on dashboard');
  });

  test('should successfully create appointment with required fields', async ({ page }) => {
    console.log('✅ Starting appointment creation test');
    
    // ===== STEP 1: CREATE TEST CLIENT AND PATIENT =====
    console.log('📝 Creating test client and patient...');
    
    // Create test data
    const timestamp = Date.now();
    const clientName = { firstName: 'Test', lastName: `Owner${timestamp}` };
    const animalName = `TestPet${timestamp}`;
    
    // Create client
    await createCustomer(page, clientName);
    await page.waitForTimeout(2000);
    
    // Click "New Patient" button on the contact record page
    console.log('📋 Clicking "New Patient" button...');
    const newPatientButton = page.getByTestId('NewPatient');
    await newPatientButton.click();
    await page.waitForTimeout(2000);
    
    // Create patient
    console.log('📝 Creating test patient in new tab...');
    await createAnimalWithOwner(
      page,
      animalName,
      clientName.firstName,
      clientName.lastName
    );
    
    // Verify patient creation with success toast
    console.log('✅ Patient created successfully - verified by success toast');
    
    // ===== STEP 2: CLICK NEW APPOINTMENT BUTTON =====
    console.log('📅 Clicking "New Appointment" button...');
    
    // Click the "New Appointment" button on the patient record page
    // Use nth(1) to target the patient tab's button (second tab)
    await page.getByTestId('NewAppointment').nth(1).click();
    await page.waitForTimeout(2000);
    
    // Wait for the appointment form to appear
    await page.getByText('Appointment Details').waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ New appointment subtab opened');
    
    // ===== STEP 3: FILL PEOPLE/RESOURCES USED FIELD =====
    console.log('👤 Selecting People/Resources Used...');
    
    // Wait for form to be ready
    await page.waitForTimeout(2000);
    
    // Click the magnifying glass icon to open the dropdown
    const resourceField = page.getByTestId('Resource');
    const parentDropdown = resourceField.locator('xpath=ancestor::div[contains(@class, "newDropDown")]');
    await parentDropdown.locator('.icon-magnifying-glass').click({ force: true });
    await page.waitForTimeout(1500);
    
    // Type "Dr" directly into the field (not in left sidebar) and add space to trigger dropdown
    await resourceField.fill('Dr ');
    await page.waitForTimeout(1500);
    
    // Select the first item from the dropdown list that contains "Dr"
    // Skip the first item (display:none) and select the first item with "Dr" in its text
    await page.locator('.dropDownList.dropdown .dropDownListItem').filter({ hasText: /Dr/i }).first().click({ force: true });
    await page.waitForTimeout(1000);
    console.log('✅ People/Resources Used field filled');
    
    // ===== STEP 4: SAVE APPOINTMENT =====
    console.log('💾 Saving appointment...');
    // Use nth(2) to target the appointment tab's Save button (third tab)
    await page.getByTestId('Save').nth(2).click();
    await page.waitForTimeout(2000);
    
    // Verify appointment was created successfully
    console.log('✔️  Verifying appointment was created...');
    
    // Check for error toast first
    const errorToast = await page.locator('.toast-error, [class*="toast"][class*="error"], [class*="Error"]')
      .first()
      .textContent({ timeout: 3000 })
      .catch(() => null);
    
    if (errorToast) {
      console.log(`❌ ERROR! Appointment creation failed: ${errorToast}`);
      throw new Error(`Appointment creation failed: ${errorToast}`);
    }
    
    // Check for success toast
    const successToast = await page.locator('.toast-success, [class*="toast"][class*="success"], [class*="Success"]')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null);
    
    if (successToast) {
      console.log(`✅✅ SUCCESS! Appointment created: ${successToast}`);
    } else {
      console.log('⚠️  No success or error message found - appointment status unclear');
      throw new Error('Unable to verify appointment creation - no success or error message displayed');
    }
  });
});

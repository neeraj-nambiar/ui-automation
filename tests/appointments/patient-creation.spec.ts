import { test, expect } from '@playwright/test';
import { ezyVetLoginWithEnv } from '../../helpers/ezyvet-auth-helpers';
import { createCustomer } from '../../helpers/contact-helpers';
import { createAnimalWithOwner } from '../../helpers/patient-helpers';

test.describe('Patient Creation Test', () => {
  
  test.beforeEach(async ({ page }) => {
    await ezyVetLoginWithEnv(page);
    await page.waitForTimeout(2000);
    console.log('✅ Logged in and landed on dashboard');
  });

  test('should create a test patient with owner', async ({ page }) => {
    console.log('✅ Starting patient creation test');
    
    // Create test data
    const timestamp = Date.now();
    const clientName = { firstName: 'Test', lastName: `Owner${timestamp}` };
    const animalName = `TestPet${timestamp}`;
    
    console.log('📝 Creating test client...');
    await createCustomer(page, clientName);
    
    // Wait for contact page to fully load
    await page.waitForTimeout(2000);
    
    // Click "New Patient" button on the contact record page
    console.log('📋 Clicking "New Patient" button...');
    const newPatientButton = page.getByTestId('NewPatient');
    await newPatientButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📝 Creating test patient in new tab...');
    await createAnimalWithOwner(
      page,
      animalName,
      clientName.firstName,
      clientName.lastName
    );
    
    console.log('✅ Patient creation test completed successfully!');
  });
});


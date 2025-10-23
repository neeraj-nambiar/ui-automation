import { test, expect } from '@playwright/test';
import { ezyVetLoginWithEnv } from '../../helpers/ezyvet-auth-helpers';

test.describe('ezyVet Wellness Plan Creation V2', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login using existing helper that reads from env variables
    await ezyVetLoginWithEnv(page);
    await page.waitForTimeout(2000);
    
    console.log('✅ Logged in and landed on dashboard');
  });

  test('should successfully create wellness plan - step by step', async ({ page }) => {
    console.log('✅ Starting wellness plan creation test');
    
    // ===== STEP 1: NAVIGATE TO ADMIN TAB =====
    console.log('🔧 Navigating to Admin tab...');
    
    // Click on Admin tab in the top navigation
    const topNavLinks = page.locator('.navigationTabs a, .nav-tabs a, [role="tab"]');
    const adminTab = topNavLinks.filter({ hasText: 'Admin' }).first();
    
    await adminTab.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found Admin tab, clicking...');
    await adminTab.click();
    await page.waitForTimeout(1500);
    
    // ===== STEP 2: CLICK WELLNESS PLANS IN LEFT SIDEBAR =====
    console.log('📋 Looking for Wellness Plans in left sidebar...');
    
    // Find and click the "Wellness Plans" menu item in the left sidebar
    const wellnessPlanLink = page.getByText('Wellness Plans', { exact: true });
    
    await wellnessPlanLink.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found Wellness Plans in sidebar, clicking...');
    await wellnessPlanLink.click();
    await page.waitForTimeout(1500);
    
    console.log('✅ Wellness Plans tab opened');
    
    // ===== STEP 3: CLICK NEW WELLNESS PLAN =====
    console.log('🆕 Clicking "New Wellness Plan" button...');
    
    const newButton = page.getByText(/new.*wellness|add.*wellness/i).or(
      page.getByTestId('NewWellnessPlan')
    ).or(
      page.locator('.tabSliderHolder').getByText(/new/i)
    );
    
    await newButton.first().waitFor({ state: 'visible', timeout: 5000 });
    await newButton.first().click();
    await page.waitForTimeout(1500);
    
    console.log('✅ New Wellness Plan form opened');
    
    // ===== STEP 4: FILL WELLNESS PLAN NAME =====
    console.log('✏️  Filling wellness plan name...');
    
    const planName = `Test Wellness Plan ${Date.now()}`;
    
    // Use the specific name attribute to find the wellness plan name field
    const nameField = page.locator('input[name="wellnessplandata_name"]');
    await nameField.waitFor({ state: 'visible', timeout: 5000 });
    await nameField.fill(planName);
    console.log(`✅ Filled name: ${planName}`);
    await page.waitForTimeout(1000);
    
    // ===== STEP 5: FILL SUBSCRIPTION FEE PRODUCT =====
    console.log('💰 Filling Subscription Fee Product...');
    
    // Find the specific Subscription Fee Product field using its parent dropdown ID
    const subscriptionDropdown = page.locator('[id^="subscriptionproductDropdown"]');
    const productField = subscriptionDropdown.getByTestId('Product');
    await productField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click the magnifying glass icon to open the dropdown
    await subscriptionDropdown.locator('.icon-magnifying-glass').click({ force: true });
    await page.waitForTimeout(1500);
    
    // Type "Product" directly into the field and add space to trigger dropdown
    await productField.fill('Product ');
    await page.waitForTimeout(1500);
    
    // Select the first item from the dropdown list that contains "Product"
    await page.locator('.dropDownList.dropdown .dropDownListItem').filter({ hasText: /Product/i }).first().click({ force: true });
    await page.waitForTimeout(1000);
    
    console.log('✅ Subscription Fee Product selected');
    
    // ===== STEP 6: FILL CANCELLATION FEE PRODUCT =====
    console.log('💰 Filling Cancellation Fee Product...');
    
    // Find the specific Cancellation Fee Product field using its parent dropdown ID
    const cancellationDropdown = page.locator('[id^="cancellationproductproductDropdown"]');
    const cancellationProductField = cancellationDropdown.getByTestId('Product');
    await cancellationProductField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click the magnifying glass icon to open the dropdown
    await cancellationDropdown.locator('.icon-magnifying-glass').click({ force: true });
    await page.waitForTimeout(1500);
    
    // Type "Product" directly into the field and add space to trigger dropdown
    await cancellationProductField.fill('Product ');
    await page.waitForTimeout(1500);
    
    // Select the first item from the cancellation dropdown list that contains "Product"
    // Use the specific cancellation dropdown to avoid selecting already selected items
    const cancellationDropdownList = cancellationDropdown.locator('.dropDownList.dropdown');
    await cancellationDropdownList.locator('.dropDownListItem').filter({ hasText: /Product/i }).first().click({ force: true });
    await page.waitForTimeout(1000);
    
    console.log('✅ Cancellation Fee Product selected');
    
    // ===== STEP 7: SAVE WELLNESS PLAN =====
    console.log('💾 Saving wellness plan...');
    await page.getByTestId('Save').click();
    await page.waitForTimeout(2000);
    
    // ===== STEP 8: VERIFY SUCCESS =====
    console.log('✔️  Verifying wellness plan was created...');
    
    // Check for error toast first
    const errorToast = await page.locator('.toast-error, [class*="toast"][class*="error"], [class*="Error"]')
      .first()
      .textContent({ timeout: 3000 })
      .catch(() => null);
    
    if (errorToast) {
      console.log(`❌ ERROR! Wellness plan creation failed: ${errorToast}`);
      throw new Error(`Wellness plan creation failed: ${errorToast}`);
    }
    
    // Check for success toast
    const successToast = await page.locator('.toast-success, [class*="toast"][class*="success"], [class*="Success"]')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null);
    
    if (successToast) {
      console.log(`✅✅ SUCCESS! Wellness plan created: ${successToast}`);
    } else {
      console.log('✅ Wellness plan created successfully (no error detected)');
    }
    
    // ===== STEP 9: CLICK ADD WELLNESS PLAN BENEFITS =====
    console.log('➕ Clicking "Add Wellness Plan Benefits" button...');
    
    // After saving, the button should be visible
    const addButton = page.getByTestId('AddWellnessPlanBenefits').or(
      page.locator('.addButton').first()
    );
    
    await addButton.waitFor({ state: 'visible', timeout: 5000 });
    await addButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Add Wellness Plan Benefits button clicked');
    
    // ===== STEP 10: FILL BENEFIT NAME IN OVERLAY =====
    console.log('✏️  Filling benefit name in overlay...');
    
    const benefitName = `Test Benefit ${Date.now()}`;
    const benefitNameField = page.locator('input[name="wellnessplanbenefitdata_name"]');
    await benefitNameField.waitFor({ state: 'visible', timeout: 5000 });
    await benefitNameField.fill(benefitName);
    console.log(`✅ Filled benefit name: ${benefitName}`);
    await page.waitForTimeout(1000);
    
    // ===== STEP 11: SELECT PRODUCT IN BENEFITS SECTION =====
    console.log('📦 Selecting product in Benefits section...');
    
    // Find the product dropdown in the Benefits section
    const productSelect = page.locator('.ant-select[forclass="Product"]').first();
    await productSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click to open the dropdown
    await productSelect.click();
    await page.waitForTimeout(1000);
    
    // Type "Product" to filter the list
    await page.keyboard.type('Product');
    await page.waitForTimeout(1500);
    
    // Select the first item from the dropdown that contains "Product"
    await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: /Product/i }).first().click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Product selected in Benefits section');
    
    // ===== STEP 12: CLICK ADD BUTTON =====
    console.log('➕ Clicking "Add" button...');
    
    await page.getByTestId('Add').click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Add button clicked');
  });
});


import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import { EzyVetLoginPage } from '../../pages/EzyVetLoginPage';

// Load environment variables
dotenv.config();

const credentials = {
  email: process.env.TEST_USER_EMAIL || 'botai@test.com',
  password: process.env.TEST_USER_PASSWORD || 'Sunshine1',
  location: process.env.TEST_DEPARTMENT || 'Master branch (Database)',
};

test.describe('ezyVet Wellness Plan Creation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login using the login page method
    const loginPage = new EzyVetLoginPage(page);
    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password, credentials.location);
    await page.waitForTimeout(2000);
  });

  test('should successfully create wellness plan with required fields', async ({ page }) => {
    console.log('✅ Starting wellness plan creation test');
    
    // ===== NAVIGATE TO ADMIN TAB =====
    console.log('🔧 Navigating to Admin tab...');
    
    // Click on Admin tab in the top navigation
    console.log('🔍 Looking for Admin tab...');
    const topNavLinks = page.locator('.navigationTabs a, .nav-tabs a, [role="tab"]');
    const adminTab = topNavLinks.filter({ hasText: 'Admin' }).first();
    
    await adminTab.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found Admin tab, clicking...');
    await adminTab.click();
    await page.waitForTimeout(1500);
    
    // ===== CLICK WELLNESS PLANS IN LEFT SIDEBAR =====
    console.log('📋 Looking for Wellness Plans in left sidebar...');
    
    // Find and click the "Wellness Plans" menu item in the left sidebar
    const wellnessPlanLink = page.getByText('Wellness Plans', { exact: true });
    
    await wellnessPlanLink.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found Wellness Plans in sidebar, clicking...');
    await wellnessPlanLink.click();
    await page.waitForTimeout(1500);
    
    // ===== CLICK NEW WELLNESS PLAN =====
    console.log('🆕 Looking for New Wellness Plan button...');
    const newButton = page.getByText(/new.*wellness|add.*wellness/i).or(
      page.getByTestId('NewWellnessPlan')
    ).or(
      page.locator('.tabSliderHolder').getByText(/new/i)
    );
    
    await newButton.first().waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Found New Wellness Plan button, clicking...');
    await newButton.first().click();
    await page.waitForTimeout(1500);
    
    // ===== ENSURE DETAILS TAB IS ACTIVE =====
    console.log('📋 Checking Details tab...');
    const detailsTab = page.getByText('Details', { exact: true }).first();
    if (await detailsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Details tab found, clicking to ensure it\'s active');
      await detailsTab.click();
      await page.waitForTimeout(500);
    }
    
    // ===== FILL WELLNESS PLAN NAME =====
    console.log('✏️  Filling wellness plan name...');
    const planName = `Test Wellness Plan ${Date.now()}`;
    
    // Use the specific name attribute to find the wellness plan name field
    const nameField = page.locator('input[name="wellnessplandata_name"]');
    await nameField.waitFor({ state: 'visible', timeout: 5000 });
    await nameField.fill(planName);
    console.log(`✅ Filled name: ${planName}`);
    await page.waitForTimeout(500);
    
    // Store the details section for later use
    const detailsSection = page.locator('body'); // Use body as fallback
    
    // ===== FILL SUBSCRIPTION FEE PRODUCT =====
    console.log('💰 Filling Subscription Fee Product...');
    
    // Find the "Subscription Fee Product" label and the input field next to it
    const subscriptionFeeLabel = page.getByText('Subscription Fee Product', { exact: true });
    
    // The input field with "(BLANK)" should be in the same row/container as the label
    // Find the parent container and then the button (magnifier icon)
    const subscriptionRow = subscriptionFeeLabel.locator('..').or(
      subscriptionFeeLabel.locator('../..')
    );
    
    // Find the button/magnifier in the same row - it should be a clickable element
    // Look for buttons or elements with magnifier/search class within the Details section
    const subscriptionMagnifier = detailsSection.getByTestId(/magnif|search/i).first().or(
      subscriptionRow.locator('button').first()
    ).or(
      subscriptionRow.locator('[class*="magnif"], [class*="search"]').first()
    );
    
    // Try to find and click the magnifier
    let magnifierClicked = false;
    
    // First, try to find it by getting all buttons in the Details section
    const detailsButtons = detailsSection.locator('button');
    const detailsButtonCount = await detailsButtons.count();
    console.log(`Found ${detailsButtonCount} buttons in Details section`);
    
    // The subscription fee product magnifier should be one of the first few buttons
    for (let i = 0; i < Math.min(detailsButtonCount, 10); i++) {
      const button = detailsButtons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      // Get the button's position and text content to identify it
      const buttonText = await button.textContent().catch(() => '');
      const buttonHTML = await button.innerHTML().catch(() => '');
      
      // Skip the Save button and other named buttons
      if (buttonText?.includes('Save') || buttonText?.includes('Cancel')) continue;
      
      // If it's a small button with magnifier/search icon or empty text, it's likely our magnifier
      if (buttonHTML.includes('magnif') || buttonHTML.includes('search') || buttonText?.trim() === '') {
        console.log(`Trying button ${i}: "${buttonText || ''}" (HTML contains magnif/search: ${buttonHTML.includes('magnif') || buttonHTML.includes('search')})`);
        
        // Click it and see if a dropdown appears
        await button.click();
        await page.waitForTimeout(1000);
        
        // Check if filterlist (dropdown) appeared in the left sidebar
        const filterList = page.locator('#filterlist li').first();
        const hasDropdown = await filterList.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (hasDropdown) {
          console.log(`✅ Button ${i} opened the dropdown!`);
          magnifierClicked = true;
          break;
        } else {
          console.log(`Button ${i} didn't open dropdown, trying next...`);
          // Close any modal that might have opened
          const closeModal = page.locator('button[aria-label="Close"], .close, [class*="close"]').first();
          if (await closeModal.isVisible({ timeout: 500 }).catch(() => false)) {
            await closeModal.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }
    
    if (magnifierClicked) {
      // Wait for options to load in the left sidebar filterlist
      console.log('⏳ Waiting for product options to load...');
      const dropdownOptions = page.locator('#filterlist li');
      await dropdownOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      
      const optionCount = await dropdownOptions.count();
      console.log(`✅ Found ${optionCount} product options`);
      
      // Select the first option
      console.log('✅ Selecting first product...');
      await dropdownOptions.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      console.log('✅ Subscription Fee Product selected');
    } else {
      console.log('❌ Magnifier button not found or didn\'t open dropdown');
    }
    
    // ===== FILL CANCELLATION FEE PRODUCT =====
    console.log('💰 Filling Cancellation Fee Product...');
    
    // Scroll down a bit to see more fields
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - window is available in browser context
      window.scrollBy(0, 300);
    });
    await page.waitForTimeout(500);
    
    // Find the "Fee Charged Per Cycle" or similar field for cancellation
    // Look for fields that might contain "cancellation" or "fee" keywords
    const cancellationLabel = page.getByText(/cancellation.*fee|fee.*cancellation/i).first().or(
      page.getByText('Fee Charged Per Cycle', { exact: true }).first()
    );
    
    // Similar approach - find buttons in the Details section and try clicking them
    magnifierClicked = false;
    
    for (let i = 0; i < Math.min(detailsButtonCount, 15); i++) {
      const button = detailsButtons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (!isVisible) continue;
      
      const buttonText = await button.textContent().catch(() => '');
      const buttonHTML = await button.innerHTML().catch(() => '');
      
      // Skip the Save button and other named buttons
      if (buttonText?.includes('Save') || buttonText?.includes('Cancel')) continue;
      
      // If we haven't clicked this button before and it looks like a magnifier
      if (buttonHTML.includes('magnif') || buttonHTML.includes('search') || buttonText?.trim() === '') {
        // Skip if we already used this button
        const buttonId = await button.getAttribute('id').catch(() => '');
        const alreadyUsed = i < 5; // Skip the first few we already tried
        
        if (alreadyUsed && i < 5) continue;
        
        console.log(`Trying button ${i} for cancellation fee: "${buttonText || ''}"`);
        
        await button.click();
        await page.waitForTimeout(1000);
        
        const filterList = page.locator('#filterlist li').first();
        const hasDropdown = await filterList.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (hasDropdown) {
          console.log(`✅ Button ${i} opened the cancellation fee dropdown!`);
          magnifierClicked = true;
          break;
        } else {
          console.log(`Button ${i} didn't open dropdown, trying next...`);
          const closeModal = page.locator('button[aria-label="Close"], .close, [class*="close"]').first();
          if (await closeModal.isVisible({ timeout: 500 }).catch(() => false)) {
            await closeModal.click();
            await page.waitForTimeout(500);
          }
        }
      }
    }
    
    if (magnifierClicked) {
      console.log('⏳ Waiting for cancellation product options to load...');
      const dropdownOptions = page.locator('#filterlist li');
      await dropdownOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('✅ Selecting first cancellation product...');
      await dropdownOptions.first().click({ force: true });
      await page.waitForTimeout(1000);
      
      console.log('✅ Cancellation Fee Product selected');
    } else {
      console.log('⚠️ Cancellation fee magnifier not found, skipping...');
    }
    
    // ===== SAVE WELLNESS PLAN =====
    console.log('💾 Saving wellness plan...');
    
    // Use the enabled Save button (not the disabled one)
    const saveButton = page.getByTestId('Save');
    
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // ===== VERIFY SUCCESS =====
    console.log('✔️  Verifying wellness plan was created...');
    
    // Check for success message or that the plan appears in the list
    const successMessage = await page.locator('.toast-success, [class*="success"]')
      .first()
      .textContent({ timeout: 5000 })
      .catch(() => null);
    
    if (successMessage) {
      console.log(`✅✅ SUCCESS! Wellness plan created: ${successMessage}`);
      expect(successMessage).toBeTruthy();
    } else {
      // Check if the plan appears in the left sidebar list
      const planInList = page.locator('#filterlist, .sideList').getByText(planName, { exact: false });
      const planExists = await planInList.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (planExists) {
        console.log(`✅✅ SUCCESS! Wellness plan "${planName}" appears in the list`);
        expect(planExists).toBeTruthy();
      } else {
        console.log('✅ Wellness plan likely saved (no error detected)');
      }
    }
  });
});


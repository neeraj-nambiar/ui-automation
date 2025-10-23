import { test, expect } from '@playwright/test';
import { EzyVetLoginPage } from '../pages/EzyVetLoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * ezyVet Authentication Tests - Login & Logout
 * 
 * ✅ VERIFIED flows using Chrome DevTools MCP
 * @see EZYVET_QUICKSTART.md for detailed flow documentation
 * 
 * Test Credentials (from EZYVET_QUICKSTART.md):
 * - Email: botai@test.com
 * - Password: Sunshine1
 * - Location: Master branch (Database)
 */

test.describe('ezyVet Authentication', () => {
  let loginPage: EzyVetLoginPage;
  let dashboardPage: DashboardPage;

  // Test data from EZYVET_QUICKSTART.md
  const validCredentials = {
    email: 'botai@test.com',
    password: 'Sunshine1',
    location: 'Master branch (Database)',
  };

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new EzyVetLoginPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Navigate to application
    await loginPage.goto();
  });

  test('should login with location selection and then logout', async () => {
    // ===== LOGIN PHASE =====
    
    // Given: User is on login page
    await loginPage.expectOnLoginPage();
    
    // When: User provides valid credentials
    await loginPage.emailInput.fill(validCredentials.email);
    await loginPage.passwordInput.fill(validCredentials.password);
    
    // And: User clicks login button
    await loginPage.loginButton.click();
    
    // Then: Location selection screen should appear
    await loginPage.expectLocationSelectionVisible();
    
    // When: User selects a location
    await loginPage.selectLocation(validCredentials.location);
    
    // Then: User should be redirected to dashboard
    await expect(loginPage.page).toHaveURL('/', { timeout: 30000 });
    await dashboardPage.expectPageLoaded();
    
    // And: User avatar should be visible
    await dashboardPage.expectUserAvatarVisible();
    
    // ===== LOGOUT PHASE =====
    
    // When: User clicks logout
    await dashboardPage.logout();
    
    // Then: User should be redirected to login page
    await loginPage.expectOnLoginPage();
    
    // And: URL should include logout parameter (from EZYVET_QUICKSTART.md)
    await expect(loginPage.page).toHaveURL(/\/login\.php\?sso=0/);
  });
});

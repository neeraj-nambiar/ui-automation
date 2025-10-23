import { Page, expect, Locator } from '@playwright/test';
import type { UserCredentials } from '../models/User';

/**
 * ezyVet Login Page Object Model
 * Handles login interactions specific to ezyVet application
 * 
 * ✅ VERIFIED with Chrome DevTools MCP testing
 * @see EZYVET_QUICKSTART.md for verified flow details
 */
export class EzyVetLoginPage {
  readonly page: Page;
  
  // Locators - supports both login page variations
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly locationHeading: Locator;
  readonly locationOption: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators (works on both main and portal login pages)
    this.emailInput = page.locator('#input-email, #login-email');
    this.passwordInput = page.locator('#input-password, #login-password');
    this.loginButton = page.getByText('Login', { exact: true }).first();
    this.locationHeading = page.getByText('Please select a location');
    this.locationOption = page.getByText('Master branch (Database)');
  }

  /**
   * Navigate to the ezyVet application
   * Auto-redirects to /login.php if not logged in
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Complete full login flow with location selection
   * ✅ VERIFIED Flow from EZYVET_QUICKSTART.md:
   * 1. Fill email & password
   * 2. Click Login
   * 3. Handle location selection (if appears)
   * 4. Redirect to /
   * 
   * @param email - User email (e.g., botai@test.com)
   * @param password - User password (e.g., Sunshine1)
   * @param location - Location name (default: "Master branch (Database)")
   */
  async login(email: string, password: string, location?: string) {
    // Step 1 & 2: Fill credentials
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Step 3: Click login button
    await this.loginButton.click();
    
    // Step 4: Handle location selection (REQUIRED after login!)
    await this.selectLocation(location);
    
    // Step 5: Wait for successful redirect to dashboard
    // Use a more flexible URL pattern since it might be "/" or include query params
    await this.page.waitForURL(url => !url.toString().includes('/login.php'), { timeout: 30000 });
  }

  /**
   * Login using credentials object
   * @param credentials - User credentials object
   * @param location - Optional location name
   */
  async loginWithCredentials(credentials: UserCredentials, location?: string) {
    await this.login(credentials.email, credentials.password, location);
  }

  /**
   * Handle location/department selection after login
   * ✅ VERIFIED: Location selection appears after successful credential verification
   * 
   * @param location - Location name (default: "Master branch (Database)")
   */
  async selectLocation(location?: string) {
    // Wait for location selection screen to appear
    try {
      await this.locationHeading.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      // No location selection needed - already logged in
      return;
    }

    // Click the location text (it's part of a clickable row)
    const locationName = location || 'Master branch (Database)';
    
    // Wait for the location text to be visible and clickable
    const locationElement = this.page.getByText(locationName, { exact: false });
    await locationElement.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click the location
    await locationElement.click();
    
    // Wait a moment for the navigation to start
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      // Ignore timeout - navigation might have already completed
    });
  }

  // Assertions

  /**
   * Expect to be on login page
   * Verifies presence of login form elements
   */
  async expectOnLoginPage() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL(/login/);
  }

  /**
   * Expect login to be successful
   * ✅ From EZYVET_QUICKSTART.md: successful login redirects to /
   */
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL('/');
    // Verify user avatar (shows initials) is visible
    await expect(this.page.locator('text=/^[A-Z]{2}$/').first()).toBeVisible();
  }

  /**
   * Expect location selection screen to appear
   */
  async expectLocationSelectionVisible() {
    await expect(this.locationHeading).toBeVisible();
  }

  /**
   * Expect invalid credentials error
   */
  async expectInvalidCredentialsError() {
    // Add error message locator based on actual error display
    await expect(this.page.locator('.error-message, .alert-danger')).toBeVisible();
  }

  /**
   * Check if currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return !this.page.url().includes('/login.php');
  }
}


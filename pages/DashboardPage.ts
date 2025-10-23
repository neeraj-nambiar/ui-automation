import { Page, Locator, expect } from '@playwright/test';

/**
 * ezyVet Dashboard Page Object Model
 * Encapsulates interactions with the ezyVet dashboard/home page
 * 
 * ✅ VERIFIED with Chrome DevTools MCP testing
 * @see EZYVET_QUICKSTART.md for verified logout flow
 */
export class DashboardPage {
  readonly page: Page;
  
  // Locators
  readonly userAvatar: Locator;
  readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // User avatar shows initials (e.g., "BA" for BotAI)
    this.userAvatar = page.locator('text=/^[A-Z]{2}$/').first();
    
    // Logout option in dropdown menu
    this.logoutMenuItem = page.getByText('Logout');
  }

  /**
   * Navigate to the dashboard page
   * In ezyVet, successful login redirects to /
   */
  async goto() {
    await this.page.goto('/');
    await this.expectPageLoaded();
  }

  /**
   * Complete logout flow
   * ✅ VERIFIED Flow from EZYVET_QUICKSTART.md:
   * 1. Click user avatar (shows initials like "BA")
   * 2. Click "Logout" from dropdown
   * 3. Redirects to /login.php?sso=0
   */
  async logout() {
    // Step 1: Click user avatar to open dropdown
    await this.userAvatar.click();
    
    // Step 2: Click "Logout" from the dropdown menu
    await this.logoutMenuItem.click();
    
    // Step 3: Wait for redirect to login page
    await this.page.waitForURL(/\/login\.php/);
  }

  /**
   * Open user menu dropdown
   * Shows: initials, name, email, Manage Account, Lock, Logout
   */
  async openUserMenu() {
    await this.userAvatar.click();
  }

  /**
   * Get user initials from avatar
   */
  async getUserInitials(): Promise<string | null> {
    return await this.userAvatar.textContent();
  }

  // Assertions

  /**
   * Expect dashboard page to be loaded
   * Verifies we're on the main page with user avatar visible
   */
  async expectPageLoaded() {
    await expect(this.page).toHaveURL('/');
    await expect(this.userAvatar).toBeVisible();
  }

  /**
   * Expect user avatar to be visible
   */
  async expectUserAvatarVisible() {
    await expect(this.userAvatar).toBeVisible();
  }

  /**
   * Expect user dropdown menu to be visible
   * Call after openUserMenu()
   */
  async expectUserMenuOpen() {
    await expect(this.logoutMenuItem).toBeVisible();
    await expect(this.page.getByText('Manage Account')).toBeVisible();
  }

  /**
   * Expect logout to be successful
   * ✅ From EZYVET_QUICKSTART.md: logout redirects to /login.php?sso=0
   */
  async expectLogoutSuccess() {
    await expect(this.page).toHaveURL(/\/login\.php\?sso=0/);
  }
}


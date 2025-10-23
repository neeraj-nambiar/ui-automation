import { Page, Locator, expect } from '@playwright/test';

/**
 * Navigation Bar Component
 * Reusable component for navigation bar interactions
 */
export class NavBar {
  readonly page: Page;
  readonly container: Locator;
  
  // Navigation links
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly aboutLink: Locator;
  
  // User menu
  readonly userMenu: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Root container for the navbar
    this.container = page.locator('nav[role="navigation"], [data-testid="navbar"]');
    
    // Scoped locators within the navbar
    this.homeLink = this.container.getByRole('link', { name: /home/i });
    this.productsLink = this.container.getByRole('link', { name: /products/i });
    this.aboutLink = this.container.getByRole('link', { name: /about/i });
    
    this.userMenu = this.container.getByRole('button', { name: /user menu|account/i });
    this.profileLink = this.container.getByRole('link', { name: /profile/i });
    this.settingsLink = this.container.getByRole('link', { name: /settings/i });
    this.logoutButton = this.container.getByRole('button', { name: /log ?out/i });
  }

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.homeLink.click();
  }

  /**
   * Navigate to products page
   */
  async navigateToProducts() {
    await this.productsLink.click();
  }

  /**
   * Navigate to about page
   */
  async navigateToAbout() {
    await this.aboutLink.click();
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.userMenu.click();
  }

  /**
   * Navigate to profile
   */
  async navigateToProfile() {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  /**
   * Navigate to settings
   */
  async navigateToSettings() {
    await this.openUserMenu();
    await this.settingsLink.click();
  }

  /**
   * Logout user
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  // Assertions

  /**
   * Expect navbar to be visible
   */
  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Expect user menu to be visible
   */
  async expectUserMenuVisible() {
    await expect(this.userMenu).toBeVisible();
  }

  /**
   * Expect specific link to be active
   */
  async expectLinkActive(linkName: string) {
    const link = this.container.getByRole('link', { name: new RegExp(linkName, 'i') });
    await expect(link).toHaveClass(/active|current/);
  }
}




import { Page, Locator, expect } from '@playwright/test';

/**
 * Footer Component
 * Reusable component for footer interactions
 */
export class Footer {
  readonly page: Page;
  readonly container: Locator;
  
  // Footer links
  readonly privacyPolicyLink: Locator;
  readonly termsOfServiceLink: Locator;
  readonly contactLink: Locator;
  readonly copyrightText: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Root container for the footer
    this.container = page.locator('footer, [role="contentinfo"], [data-testid="footer"]');
    
    // Scoped locators within the footer
    this.privacyPolicyLink = this.container.getByRole('link', { name: /privacy policy/i });
    this.termsOfServiceLink = this.container.getByRole('link', { name: /terms of service|terms/i });
    this.contactLink = this.container.getByRole('link', { name: /contact|contact us/i });
    this.copyrightText = this.container.locator('[data-testid="copyright"]');
  }

  /**
   * Navigate to privacy policy
   */
  async navigateToPrivacyPolicy() {
    await this.privacyPolicyLink.click();
  }

  /**
   * Navigate to terms of service
   */
  async navigateToTermsOfService() {
    await this.termsOfServiceLink.click();
  }

  /**
   * Navigate to contact page
   */
  async navigateToContact() {
    await this.contactLink.click();
  }

  /**
   * Get copyright text
   */
  async getCopyrightText(): Promise<string | null> {
    return await this.copyrightText.textContent();
  }

  // Assertions

  /**
   * Expect footer to be visible
   */
  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Expect copyright text to contain year
   */
  async expectCopyrightYear(year: number) {
    await expect(this.copyrightText).toContainText(year.toString());
  }
}




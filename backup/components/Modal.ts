import { Page, Locator, expect } from '@playwright/test';

/**
 * Modal Component
 * Reusable component for modal dialog interactions
 */
export class Modal {
  readonly page: Page;
  readonly container: Locator;
  
  // Modal elements
  readonly title: Locator;
  readonly content: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Root container for the modal
    this.container = page.getByRole('dialog');
    
    // Scoped locators within the modal
    this.title = this.container.getByRole('heading');
    this.content = this.container.locator('.modal-content, [data-testid="modal-content"]');
    this.closeButton = this.container.getByRole('button', { name: /close|×/i });
    this.confirmButton = this.container.getByRole('button', { name: /confirm|ok|yes/i });
    this.cancelButton = this.container.getByRole('button', { name: /cancel|no/i });
  }

  /**
   * Wait for modal to appear
   */
  async waitForModal() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Close modal using close button
   */
  async close() {
    await this.closeButton.click();
    await this.expectClosed();
  }

  /**
   * Confirm action in modal
   */
  async confirm() {
    await this.confirmButton.click();
  }

  /**
   * Cancel action in modal
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Get modal title text
   */
  async getTitle(): Promise<string | null> {
    return await this.title.textContent();
  }

  /**
   * Get modal content text
   */
  async getContent(): Promise<string | null> {
    return await this.content.textContent();
  }

  // Assertions

  /**
   * Expect modal to be visible
   */
  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  /**
   * Expect modal to be closed/not visible
   */
  async expectClosed() {
    await expect(this.container).not.toBeVisible();
  }

  /**
   * Expect modal to have specific title
   */
  async expectTitle(title: string) {
    await expect(this.title).toHaveText(title);
  }

  /**
   * Expect modal content to contain text
   */
  async expectContent(text: string) {
    await expect(this.content).toContainText(text);
  }

  /**
   * Expect confirm button to be visible
   */
  async expectConfirmButtonVisible() {
    await expect(this.confirmButton).toBeVisible();
  }

  /**
   * Expect cancel button to be visible
   */
  async expectCancelButtonVisible() {
    await expect(this.cancelButton).toBeVisible();
  }
}




import { Page, Locator, expect } from '@playwright/test';

/**
 * Product Page Object Model
 * Encapsulates interactions with the product page
 */
export class ProductPage {
  readonly page: Page;
  
  // Locators
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Define locators
    this.searchInput = page.getByPlaceholder(/search products/i);
    this.searchButton = page.getByRole('button', { name: /search/i });
    this.productCards = page.locator('[data-testid="product-card"]');
    this.addToCartButtons = page.getByRole('button', { name: /add to cart/i });
  }

  /**
   * Navigate to the products page
   */
  async goto() {
    await this.page.goto('/products');
    await this.expectPageLoaded();
  }

  /**
   * Search for products
   */
  async searchProducts(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  /**
   * Get product card by name
   */
  getProductCard(productName: string): Locator {
    return this.page.locator(`[data-testid="product-card"]:has-text("${productName}")`);
  }

  /**
   * Add product to cart by name
   */
  async addProductToCart(productName: string) {
    const productCard = this.getProductCard(productName);
    await productCard.getByRole('button', { name: /add to cart/i }).click();
  }

  /**
   * Get total number of products displayed
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  // Assertions

  /**
   * Expect products page to be loaded
   */
  async expectPageLoaded() {
    await expect(this.searchInput).toBeVisible();
  }

  /**
   * Expect product to be visible
   */
  async expectProductVisible(productName: string) {
    await expect(this.getProductCard(productName)).toBeVisible();
  }

  /**
   * Expect specific number of products
   */
  async expectProductCount(count: number) {
    await expect(this.productCards).toHaveCount(count);
  }

  /**
   * Expect no products found
   */
  async expectNoProducts() {
    await expect(this.productCards).toHaveCount(0);
  }
}




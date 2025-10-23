/**
 * Test data generation helpers
 * Note: Install @faker-js/faker for production use: npm install -D @faker-js/faker
 */

/**
 * Generates a random email address
 * @returns Random email
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test.${timestamp}.${random}@example.com`;
}

/**
 * Generates a random password
 * @param length - Password length (default: 12)
 * @returns Random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generates random user data
 * @returns User object with random data
 */
export function generateUserData() {
  const timestamp = Date.now();
  return {
    firstName: `TestFirstName${timestamp}`,
    lastName: `TestLastName${timestamp}`,
    email: generateRandomEmail(),
    password: generateRandomPassword(),
    phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
  };
}

/**
 * Generates a unique test ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique test ID
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Formats currency for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generates random product data
 * @returns Product object with random data
 */
export function generateProductData() {
  const timestamp = Date.now();
  return {
    name: `Test Product ${timestamp}`,
    description: `Test product description for ${timestamp}`,
    price: Math.floor(Math.random() * 10000) + 100, // Price in cents
    sku: `SKU-${timestamp}`,
    stock: Math.floor(Math.random() * 100) + 1,
  };
}

/**
 * Wait for a specified duration
 * @param ms - Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get future date in YYYY-MM-DD format
 * @param daysFromNow - Number of days from today
 * @returns Formatted date string
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}




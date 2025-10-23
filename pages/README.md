# Pages Directory

This directory contains **Page Object Models (POM)** that encapsulate page-specific interactions and elements.

## 📖 Page Object Model (POM)

The Page Object Model is a design pattern that:
- Encapsulates page structure and behavior
- Reduces code duplication
- Improves test maintainability
- Makes tests more readable

## 🏗️ Structure

Each page object should:
1. **Encapsulate locators** for all page elements
2. **Provide action methods** for user interactions
3. **Include assertion methods** for validations
4. **Return typed data** when retrieving information

## ✍️ Page Object Template

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ExamplePage {
  readonly page: Page;
  
  // Locators
  readonly heading: Locator;
  readonly submitButton: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Define locators using user-centric selectors
    this.heading = page.getByRole('heading', { name: 'Example' });
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.emailInput = page.getByLabel('Email address');
  }

  // Navigation
  async goto() {
    await this.page.goto('/example');
    await this.waitForPageLoad();
  }

  // Actions
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async submit() {
    await this.submitButton.click();
  }

  async fillAndSubmit(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  // Assertions
  async expectPageLoaded() {
    await expect(this.heading).toBeVisible();
  }

  async expectSubmitSuccess() {
    await expect(this.page).toHaveURL(/.*success/);
  }

  // Helpers
  private async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

## 🎯 Best Practices

### 1. Use User-Centric Locators

```typescript
// ✅ GOOD: User-centric, accessible
this.loginButton = page.getByRole('button', { name: 'Login' });
this.emailField = page.getByLabel('Email address');
this.heading = page.getByRole('heading', { name: 'Welcome' });

// ❌ BAD: Implementation-dependent
this.loginButton = page.locator('.btn-primary-login');
this.emailField = page.locator('#email-input-field-123');
```

### 2. Keep Actions at the Right Level

```typescript
// ✅ GOOD: High-level actions
async login(email: string, password: string) {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
}

// ❌ BAD: Too granular in tests
// test('login', async ({ page }) => {
//   await page.fill('#email', 'test@example.com');
//   await page.fill('#password', 'password');
//   await page.click('button');
// });
```

### 3. Return Typed Data

```typescript
// ✅ GOOD: Return typed data
async getUser(): Promise<User> {
  const name = await this.userName.textContent();
  const email = await this.userEmail.textContent();
  return { name, email };
}

// ❌ BAD: No typing
async getUser() {
  return {
    name: await this.userName.textContent(),
    email: await this.userEmail.textContent(),
  };
}
```

### 4. Include Assertions in Page Objects

```typescript
// ✅ GOOD: Page-specific assertions
async expectLoginSuccess() {
  await expect(this.page).toHaveURL(/.*dashboard/);
  await expect(this.welcomeMessage).toBeVisible();
}

// Also OK: Assert in tests if it's test-specific
test('login shows welcome message', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@test.com', 'pass123');
  await expect(page.locator('.welcome')).toContainText('Welcome back!');
});
```

### 5. Handle Complex Interactions

```typescript
// ✅ GOOD: Encapsulate complex interactions
async selectFromDropdown(option: string) {
  await this.dropdown.click();
  await this.page.getByRole('option', { name: option }).click();
  await this.page.waitForLoadState('networkidle');
}

async uploadFile(filePath: string) {
  await this.fileInput.setInputFiles(filePath);
  await this.expectUploadComplete();
}
```

## 🔄 Page Object Composition

For complex pages, compose smaller components:

```typescript
import { NavBarComponent } from '../components/NavBar';
import { FooterComponent } from '../components/Footer';

export class DashboardPage {
  readonly page: Page;
  readonly navbar: NavBarComponent;
  readonly footer: FooterComponent;
  
  constructor(page: Page) {
    this.page = page;
    this.navbar = new NavBarComponent(page);
    this.footer = new FooterComponent(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
  }
}
```

## 📚 Usage in Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('user can login and access dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);
  
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await loginPage.expectLoginSuccess();
  
  await dashboard.expectPageLoaded();
});
```

## 🎨 Naming Conventions

- Page classes: `{PageName}Page.ts` (e.g., `LoginPage.ts`, `DashboardPage.ts`)
- Methods: Use descriptive verb prefixes
  - `goto()`: Navigate to page
  - `fill{Field}()`: Fill form fields
  - `click{Element}()`: Click actions
  - `select{Option}()`: Select from dropdowns
  - `expect{Condition}()`: Assertions
  - `get{Data}()`: Retrieve data




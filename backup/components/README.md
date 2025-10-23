# Components Directory

This directory contains **Component Object Models** for reusable UI components that appear across multiple pages.

## 📖 Component Object Model

Components are reusable UI elements that:
- Appear on multiple pages (navbar, footer, modals, etc.)
- Encapsulate component-specific interactions
- Can be composed into page objects
- Promote code reuse and maintainability

## 🎯 When to Create a Component

Create a component object when:
- ✅ The UI element appears on multiple pages
- ✅ The element has complex interactions
- ✅ The element has its own state/behavior
- ✅ You want to test the component in isolation

Examples:
- Navigation bars
- Footers
- Modal dialogs
- Search bars
- Notification toasts
- Dropdown menus
- Form controls

## ✍️ Component Template

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ComponentName {
  readonly page: Page;
  readonly container: Locator;
  
  // Component-specific locators
  readonly element1: Locator;
  readonly element2: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Root container for the component
    this.container = page.locator('[data-testid="component-container"]');
    
    // Scoped locators within the container
    this.element1 = this.container.getByRole('button', { name: 'Action' });
    this.element2 = this.container.getByLabel('Input');
  }

  // Component actions
  async performAction() {
    await this.element1.click();
  }

  async fillInput(value: string) {
    await this.element2.fill(value);
  }

  // Component assertions
  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  async expectHidden() {
    await expect(this.container).not.toBeVisible();
  }
}
```

## 📋 Example: Navigation Bar Component

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class NavBar {
  readonly page: Page;
  readonly container: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('nav[role="navigation"]');
    
    // Scoped to navbar
    this.homeLink = this.container.getByRole('link', { name: 'Home' });
    this.productsLink = this.container.getByRole('link', { name: 'Products' });
    this.cartLink = this.container.getByRole('link', { name: 'Cart' });
    this.userMenu = this.container.getByRole('button', { name: 'User menu' });
    this.logoutButton = this.container.getByRole('menuitem', { name: 'Logout' });
  }

  async navigateToHome() {
    await this.homeLink.click();
  }

  async navigateToProducts() {
    await this.productsLink.click();
  }

  async navigateToCart() {
    await this.cartLink.click();
  }

  async openUserMenu() {
    await this.userMenu.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  async expectCartCount(count: number) {
    await expect(this.cartLink).toContainText(count.toString());
  }
}
```

## 📋 Example: Modal Component

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class Modal {
  readonly page: Page;
  readonly container: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByRole('dialog');
    this.title = this.container.getByRole('heading');
    this.closeButton = this.container.getByRole('button', { name: 'Close' });
    this.confirmButton = this.container.getByRole('button', { name: 'Confirm' });
    this.cancelButton = this.container.getByRole('button', { name: 'Cancel' });
  }

  async waitForModal() {
    await expect(this.container).toBeVisible();
  }

  async close() {
    await this.closeButton.click();
    await this.expectClosed();
  }

  async confirm() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectVisible() {
    await expect(this.container).toBeVisible();
  }

  async expectClosed() {
    await expect(this.container).not.toBeVisible();
  }

  async expectTitle(title: string) {
    await expect(this.title).toHaveText(title);
  }
}
```

## 🔄 Using Components in Page Objects

```typescript
import { Page } from '@playwright/test';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export class DashboardPage {
  readonly page: Page;
  readonly navbar: NavBar;
  readonly footer: Footer;

  constructor(page: Page) {
    this.page = page;
    
    // Compose with components
    this.navbar = new NavBar(page);
    this.footer = new Footer(page);
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async navigateToProducts() {
    await this.navbar.navigateToProducts();
  }

  async logout() {
    await this.navbar.logout();
  }
}
```

## 🎯 Best Practices

### 1. Scope Locators to Component Container

```typescript
// ✅ GOOD: Scoped to component
constructor(page: Page) {
  this.container = page.locator('[data-testid="navbar"]');
  this.homeLink = this.container.getByRole('link', { name: 'Home' });
}

// ❌ BAD: Global scope
constructor(page: Page) {
  this.homeLink = page.getByRole('link', { name: 'Home' }); // Could match anywhere
}
```

### 2. Keep Components Focused

```typescript
// ✅ GOOD: Component handles its own behavior
class Modal {
  async confirm() {
    await this.confirmButton.click();
    await this.expectClosed(); // Modal knows it should close
  }
}

// ❌ BAD: Leaking component behavior to tests
// test('confirm modal', async ({ page }) => {
//   await modal.confirmButton.click();
//   await expect(page.locator('.modal')).not.toBeVisible();
// });
```

### 3. Make Components Reusable

```typescript
// ✅ GOOD: Generic, reusable
class Toast {
  constructor(page: Page) {
    this.container = page.locator('[role="alert"]');
  }
  
  async expectMessage(message: string) {
    await expect(this.container).toContainText(message);
  }
}

// ❌ BAD: Too specific
class SuccessToast {
  async expectLoginSuccessMessage() {
    await expect(this.container).toContainText('Login successful');
  }
}
```

## 📚 Usage in Tests

```typescript
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { Modal } from '../components/Modal';

test('user can logout via navbar', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  const confirmModal = new Modal(page);
  
  await dashboard.goto();
  await dashboard.navbar.logout();
  
  // Confirm logout in modal
  await confirmModal.expectVisible();
  await confirmModal.expectTitle('Confirm Logout');
  await confirmModal.confirm();
  
  await expect(page).toHaveURL('/login');
});
```

## 🎨 Naming Conventions

- Component classes: Descriptive names without "Component" suffix
  - `NavBar.ts`, `Footer.ts`, `Modal.ts`
- Methods: Use descriptive verbs
  - Actions: `open()`, `close()`, `select()`, `navigate()`
  - Assertions: `expect{Condition}()`
  - Queries: `get{Data}()`, `is{State}()`




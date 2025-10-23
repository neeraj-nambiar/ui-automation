# Tests Directory

This directory contains all test specifications organized by feature/module.

## 📁 Structure

```
tests/
├── auth/              # Authentication & authorization tests
│   ├── login.spec.ts
│   └── logout.spec.ts
├── products/          # Product-related tests
│   ├── product-search.spec.ts
│   └── product-details.spec.ts
└── checkout/          # Checkout flow tests
    ├── cart.spec.ts
    └── payment.spec.ts
```

## 🎯 Naming Conventions

- Test files should end with `.spec.ts` or `.test.ts`
- Use descriptive names: `login.spec.ts`, `user-registration.spec.ts`
- Group related tests in subdirectories by feature

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('h1')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');
  await loginPage.expectLoginSuccess();
});
```

### Using Custom Fixtures

```typescript
import { test } from '../../fixtures/test-fixtures';

test('authenticated user can access dashboard', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await expect(authenticatedPage.locator('h1')).toContainText('Dashboard');
});
```

## 🏷️ Test Tags

Use tags to organize and filter tests:

```typescript
test('critical user flow @smoke @critical', async ({ page }) => {
  // Critical path test
});

test('edge case scenario @regression', async ({ page }) => {
  // Full regression test
});
```

Run tagged tests:
```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
```

## 📊 Test Organization Best Practices

1. **Feature-based Organization**: Group tests by application features
2. **Test Independence**: Each test should be able to run independently
3. **Clear Descriptions**: Use descriptive test names that explain what is being tested
4. **Setup/Teardown**: Use `beforeEach`/`afterEach` for common setup and cleanup
5. **Data Isolation**: Use unique test data to avoid conflicts between tests
6. **Assertions**: Include meaningful assertions that validate expected behavior

## 🔍 Running Specific Tests

```bash
# Run all tests in a directory
npx playwright test tests/auth

# Run specific test file
npx playwright test tests/auth/login.spec.ts

# Run tests matching a pattern
npx playwright test login

# Run a specific test by line number
npx playwright test tests/auth/login.spec.ts:10
```




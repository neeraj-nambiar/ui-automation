# Fixtures Directory

This directory contains **custom Playwright fixtures** for reusable test setup and teardown logic.

## 📖 What are Fixtures?

Fixtures are Playwright's way to:
- Set up test environment before each test
- Tear down and clean up after tests
- Share common test dependencies
- Isolate test state
- Provide reusable test contexts

## 🎯 When to Create a Fixture

Create custom fixtures when:
- ✅ Multiple tests need the same setup/teardown
- ✅ You want to share authenticated sessions
- ✅ You need to provide test data to multiple tests
- ✅ You want to abstract complex setup logic
- ✅ You need to ensure cleanup happens automatically

Examples:
- Pre-authenticated user sessions
- Test database connections
- API clients
- Mock data providers
- Browser contexts with specific configurations

## ✍️ Fixture Template

```typescript
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

// Define your fixture types
type MyFixtures = {
  myFixture: string;
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  myFixture: async ({}, use) => {
    // Setup: runs before each test
    const fixture = 'setup value';
    
    // Provide fixture to test
    await use(fixture);
    
    // Teardown: runs after each test
    // Cleanup logic here
  },
});

export { expect } from '@playwright/test';
```

## 📋 Example: Authenticated User Fixture

```typescript
// fixtures/authenticated-user.ts
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { login } from '../helpers/auth-helpers';

type AuthenticatedFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
};

export const test = base.extend<AuthenticatedFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before test
    await login(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    
    // Verify login success
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Provide authenticated page to test
    await use(page);
    
    // Teardown: Logout after test (optional)
    // await logout(page);
  },

  authenticatedContext: async ({ browser }, use) => {
    // Create context with stored authentication state
    const context = await browser.newContext({
      storageState: 'auth-state.json',
    });
    
    await use(context);
    
    // Cleanup
    await context.close();
  },
});

export { expect };
```

## 📋 Example: Comprehensive Test Fixtures

```typescript
// fixtures/test-fixtures.ts
import { test as base, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { login } from '../helpers/auth-helpers';
import { generateUserData } from '../helpers/data-helpers';
import type { User, Product } from '../models';

type TestFixtures = {
  authenticatedPage: Page;
  testUser: User;
  testProduct: Product;
  apiClient: ApiClient;
};

export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    await login(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await use(page);
  },

  // Test user fixture with automatic cleanup
  testUser: async ({ page }, use) => {
    // Setup: Create test user via API
    const userData = generateUserData();
    const response = await fetch(`${process.env.API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const user = await response.json();
    
    // Provide user to test
    await use(user);
    
    // Teardown: Delete test user
    await fetch(`${process.env.API_BASE_URL}/users/${user.id}`, {
      method: 'DELETE',
    });
  },

  // Test product fixture
  testProduct: async ({}, use) => {
    // Setup: Create test product
    const product = {
      id: `test-${Date.now()}`,
      name: 'Test Product',
      price: 99.99,
      stock: 100,
    };
    
    await fetch(`${process.env.API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    
    await use(product);
    
    // Teardown: Delete test product
    await fetch(`${process.env.API_BASE_URL}/products/${product.id}`, {
      method: 'DELETE',
    });
  },

  // API client fixture
  apiClient: async ({}, use) => {
    const client = new ApiClient(process.env.API_BASE_URL!);
    await client.authenticate(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    
    await use(client);
    
    // Cleanup connections
    await client.close();
  },
});

export { expect };
```

## 📋 Example: Worker-Scoped Fixture

```typescript
// fixtures/database-fixture.ts
import { test as base } from '@playwright/test';
import { DatabaseClient } from '../utils/database';

type WorkerFixtures = {
  database: DatabaseClient;
};

export const test = base.extend<{}, WorkerFixtures>({
  // Worker-scoped: runs once per worker, shared across tests
  database: [async ({}, use, workerInfo) => {
    // Setup: Connect to database
    const db = new DatabaseClient({
      host: process.env.DB_HOST!,
      database: `test_db_worker_${workerInfo.workerIndex}`,
    });
    await db.connect();
    
    // Provide to all tests in this worker
    await use(db);
    
    // Teardown: Close connection after all tests
    await db.disconnect();
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
```

## 🎯 Fixture Scopes

### Test-Scoped (Default)
Runs before/after each test:

```typescript
export const test = base.extend({
  myFixture: async ({}, use) => {
    // Setup before each test
    await use('value');
    // Teardown after each test
  },
});
```

### Worker-Scoped
Runs once per worker, shared across tests:

```typescript
export const test = base.extend<{}, WorkerFixtures>({
  myFixture: [async ({}, use) => {
    // Setup once per worker
    await use('value');
    // Teardown after all tests in worker
  }, { scope: 'worker' }],
});
```

## 📚 Using Fixtures in Tests

### Basic Usage

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('authenticated user can view profile', async ({ authenticatedPage }) => {
  // Page is already authenticated
  await authenticatedPage.goto('/profile');
  await expect(authenticatedPage.getByRole('heading')).toContainText('My Profile');
});
```

### Multiple Fixtures

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('user can purchase product', async ({ authenticatedPage, testProduct, testUser }) => {
  // All fixtures are available
  await authenticatedPage.goto(`/products/${testProduct.id}`);
  await authenticatedPage.getByRole('button', { name: 'Buy Now' }).click();
  
  // Verify purchase
  await expect(authenticatedPage.locator('.success-message')).toBeVisible();
});
```

### Composing Fixtures

```typescript
// fixtures/admin-fixtures.ts
import { test as base } from '../fixtures/authenticated-user';

export const test = base.extend({
  adminPage: async ({ authenticatedPage }, use) => {
    // Extend authenticated page with admin permissions
    await authenticatedPage.goto('/admin');
    await use(authenticatedPage);
  },
});
```

## 🎯 Best Practices

### 1. Always Clean Up

```typescript
// ✅ GOOD: Cleanup in teardown
export const test = base.extend({
  testData: async ({}, use) => {
    const data = await createTestData();
    await use(data);
    await deleteTestData(data.id); // Always cleanup
  },
});

// ❌ BAD: No cleanup
export const test = base.extend({
  testData: async ({}, use) => {
    const data = await createTestData();
    await use(data);
    // Leaves test data behind
  },
});
```

### 2. Handle Errors Gracefully

```typescript
// ✅ GOOD: Error handling
export const test = base.extend({
  testUser: async ({}, use) => {
    let user;
    try {
      user = await createUser();
      await use(user);
    } finally {
      // Cleanup even if test fails
      if (user) {
        await deleteUser(user.id).catch(console.error);
      }
    }
  },
});
```

### 3. Use Proper Scoping

```typescript
// ✅ GOOD: Test-scoped for isolated data
export const test = base.extend({
  testUser: async ({}, use) => {
    // Fresh user for each test
    const user = await createUser();
    await use(user);
    await deleteUser(user.id);
  },
});

// ✅ GOOD: Worker-scoped for expensive setup
export const test = base.extend<{}, { database: DB }>({
  database: [async ({}, use) => {
    // Shared database connection across tests
    const db = await connectDatabase();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],
});
```

### 4. Type Your Fixtures

```typescript
// ✅ GOOD: Proper types
type MyFixtures = {
  testUser: User;
  testProduct: Product;
};

export const test = base.extend<MyFixtures>({
  testUser: async ({}, use) => {
    const user: User = await createUser();
    await use(user);
  },
});

// ❌ BAD: No types
export const test = base.extend({
  testUser: async ({}, use) => {
    const user = await createUser(); // Type unclear
    await use(user);
  },
});
```

## 🎨 Naming Conventions

- Fixture files: `*-fixtures.ts` or `*-fixture.ts`
- Fixture names: Descriptive, camelCase
  - `authenticatedPage`, `testUser`, `apiClient`
- Export both `test` and `expect`:
  ```typescript
  export const test = base.extend({...});
  export { expect } from '@playwright/test';
  ```




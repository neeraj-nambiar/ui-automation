# Data Directory

This directory contains **test data files** used across the test suite.

## 📖 Purpose

Test data files provide:
- Centralized test data management
- Reusable test datasets
- Easy data maintenance
- Separation of data from test logic
- Version control for test data

## 🎯 When to Use Data Files

Use data files for:
- ✅ Static test data that doesn't change
- ✅ Common test scenarios
- ✅ Seed data for tests
- ✅ Configuration data
- ✅ Mock API responses

Avoid data files for:
- ❌ Dynamic data that should be generated per test
- ❌ Sensitive data (use environment variables instead)
- ❌ Data that needs to be unique per test run

## 📁 File Formats

### JSON (Recommended)

```json
{
  "users": [
    {
      "id": "user-1",
      "email": "test.user@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "user"
    },
    {
      "id": "admin-1",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    }
  ]
}
```

### TypeScript (For Complex Data)

```typescript
// data/test-data.ts
import type { User } from '../models/User';

export const TEST_USERS: User[] = [
  {
    id: 'user-1',
    email: 'test.user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.User,
    status: UserStatus.Active,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
```

## 📋 Example: Test Users Data

```json
// data/test-users.json
{
  "validUsers": [
    {
      "id": "user-valid-1",
      "email": "valid.user@example.com",
      "password": "ValidPass123!",
      "firstName": "Valid",
      "lastName": "User",
      "role": "user",
      "status": "active"
    },
    {
      "id": "admin-valid-1",
      "email": "admin@example.com",
      "password": "AdminPass123!",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "status": "active"
    }
  ],
  "invalidUsers": [
    {
      "email": "invalid-email",
      "password": "short",
      "expectedError": "Invalid email format"
    },
    {
      "email": "test@example.com",
      "password": "",
      "expectedError": "Password is required"
    }
  ],
  "edgeCases": [
    {
      "email": "very.long.email.address.that.might.cause.issues@subdomain.example.com",
      "password": "ValidPass123!",
      "firstName": "A",
      "lastName": "B"
    }
  ]
}
```

## 📋 Example: Test Products Data

```json
// data/test-products.json
{
  "products": [
    {
      "id": "prod-1",
      "name": "Laptop Computer",
      "description": "High-performance laptop for testing",
      "price": 99999,
      "category": "electronics",
      "sku": "LAP-001",
      "stock": 50,
      "isActive": true
    },
    {
      "id": "prod-2",
      "name": "T-Shirt",
      "description": "Comfortable cotton t-shirt",
      "price": 1999,
      "category": "clothing",
      "sku": "TSH-001",
      "stock": 100,
      "isActive": true
    },
    {
      "id": "prod-out-of-stock",
      "name": "Out of Stock Item",
      "description": "Product with no stock",
      "price": 4999,
      "category": "other",
      "sku": "OOS-001",
      "stock": 0,
      "isActive": true
    }
  ],
  "searchQueries": [
    {
      "query": "laptop",
      "expectedResults": ["prod-1"]
    },
    {
      "query": "shirt",
      "expectedResults": ["prod-2"]
    },
    {
      "query": "nonexistent product",
      "expectedResults": []
    }
  ]
}
```

## 📋 Example: Mock API Responses

```json
// data/mock-api-responses.json
{
  "users": {
    "login": {
      "success": {
        "status": 200,
        "body": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          "user": {
            "id": "user-1",
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User"
          }
        }
      },
      "invalidCredentials": {
        "status": 401,
        "body": {
          "error": "Invalid email or password"
        }
      },
      "accountLocked": {
        "status": 403,
        "body": {
          "error": "Account locked due to too many failed login attempts"
        }
      }
    }
  },
  "products": {
    "list": {
      "success": {
        "status": 200,
        "body": {
          "products": [],
          "total": 0,
          "page": 1,
          "pageSize": 20
        }
      }
    }
  }
}
```

## 📚 Using Data in Tests

### Loading JSON Data

```typescript
import { test, expect } from '@playwright/test';
import testUsers from '../data/test-users.json';
import testProducts from '../data/test-products.json';

test('login with valid user', async ({ page }) => {
  const validUser = testUsers.validUsers[0];
  
  await page.goto('/login');
  await page.getByLabel('Email').fill(validUser.email);
  await page.getByLabel('Password').fill(validUser.password);
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page).toHaveURL(/.*dashboard/);
});

test.describe('Product search', () => {
  testProducts.searchQueries.forEach(({ query, expectedResults }) => {
    test(`search for "${query}"`, async ({ page }) => {
      await page.goto('/products');
      await page.getByPlaceholder('Search products').fill(query);
      await page.getByRole('button', { name: 'Search' }).click();
      
      // Verify results
      const results = await page.locator('[data-testid="product-card"]').all();
      expect(results).toHaveLength(expectedResults.length);
    });
  });
});
```

### Using TypeScript Data

```typescript
// data/test-scenarios.ts
import type { User } from '../models/User';

export const LOGIN_SCENARIOS = {
  validUser: {
    email: 'valid@example.com',
    password: 'ValidPass123!',
    expectedResult: 'success',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'ValidPass123!',
    expectedResult: 'error',
    expectedMessage: 'Invalid email format',
  },
  wrongPassword: {
    email: 'valid@example.com',
    password: 'WrongPassword',
    expectedResult: 'error',
    expectedMessage: 'Invalid email or password',
  },
} as const;

// Usage in test
import { test, expect } from '@playwright/test';
import { LOGIN_SCENARIOS } from '../data/test-scenarios';

test('login with invalid email', async ({ page }) => {
  const scenario = LOGIN_SCENARIOS.invalidEmail;
  
  await page.goto('/login');
  await page.getByLabel('Email').fill(scenario.email);
  await page.getByLabel('Password').fill(scenario.password);
  await page.getByRole('button', { name: 'Login' }).click();
  
  await expect(page.locator('.error-message')).toContainText(scenario.expectedMessage);
});
```

### Parameterized Tests

```typescript
import { test, expect } from '@playwright/test';
import testUsers from '../data/test-users.json';

test.describe('Login validation', () => {
  testUsers.invalidUsers.forEach((invalidUser, index) => {
    test(`shows error for invalid user ${index + 1}`, async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('Email').fill(invalidUser.email);
      await page.getByLabel('Password').fill(invalidUser.password);
      await page.getByRole('button', { name: 'Login' }).click();
      
      await expect(page.locator('.error-message')).toContainText(invalidUser.expectedError);
    });
  });
});
```

## 🎯 Best Practices

### 1. Keep Data Organized

```
data/
├── test-users.json          # User test data
├── test-products.json       # Product test data
├── mock-responses.json      # Mock API responses
└── test-scenarios.ts        # Complex test scenarios
```

### 2. Use Descriptive Keys

```json
// ✅ GOOD: Clear, descriptive keys
{
  "validUsers": [...],
  "invalidUsers": [...],
  "edgeCases": [...]
}

// ❌ BAD: Vague keys
{
  "users1": [...],
  "users2": [...],
  "users3": [...]
}
```

### 3. Include Expected Results

```json
// ✅ GOOD: Include expected outcomes
{
  "testCases": [
    {
      "input": "test@example.com",
      "expectedResult": "success",
      "expectedMessage": "Login successful"
    }
  ]
}

// ❌ BAD: Only input data
{
  "testCases": [
    {
      "input": "test@example.com"
    }
  ]
}
```

### 4. Don't Store Sensitive Data

```json
// ✅ GOOD: Reference environment variables
{
  "user": {
    "email": "test@example.com",
    "passwordEnvVar": "TEST_USER_PASSWORD"
  }
}

// ❌ BAD: Hardcoded sensitive data
{
  "user": {
    "email": "real.user@production.com",
    "password": "RealPassword123!",
    "apiKey": "sk-live-actual-production-key"
  }
}
```

### 5. Version Control Friendly

```json
// ✅ GOOD: Pretty-printed, sorted keys
{
  "users": [
    {
      "email": "admin@example.com",
      "firstName": "Admin",
      "id": "admin-1",
      "lastName": "User"
    }
  ]
}

// ❌ BAD: Minified, hard to diff
{"users":[{"email":"admin@example.com","firstName":"Admin","id":"admin-1","lastName":"User"}]}
```

## 🔄 Dynamic Data Generation

For data that should be unique per test, use helpers instead:

```typescript
// helpers/data-helpers.ts
import { faker } from '@faker-js/faker';

export function generateTestUser() {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: faker.internet.password({ length: 12 }),
  };
}

// Usage in test
import { generateTestUser } from '../helpers/data-helpers';

test('register new user', async ({ page }) => {
  const newUser = generateTestUser(); // Unique data each time
  // ... test implementation
});
```

## 🎨 Naming Conventions

- File names: `test-{entity}.json` or `mock-{purpose}.json`
- Examples:
  - `test-users.json`
  - `test-products.json`
  - `mock-api-responses.json`
  - `test-scenarios.ts`




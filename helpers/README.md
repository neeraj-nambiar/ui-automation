# Test Helpers

This directory contains reusable helper functions for test automation.

## Animal Creation (`animal-creation.ts`)

Utilities for creating and managing animal records in ezyVet.

### Functions

#### `createAnimalIfNotExists(page, animalName, ownerName, age?, tags?)`
Creates an animal or verifies it exists.

**Example:**
```typescript
await createAnimalIfNotExists(page, "Fluffy", "Smith, John");
await createAnimalIfNotExists(page, "Max", "Doe, Jane", 5, ["VIP", "Allergic"]);
```

#### `navigateToAnimal(page, animalName)`
Navigates to an animal's page.

**Example:**
```typescript
await navigateToAnimal(page, "Fluffy");
```

---

## Contact Creation (`contact-creation.ts`)

Utilities for creating and managing contact records in ezyVet.

### Functions

#### `createCustomerIfNotExists(page, customerName)`
Creates a customer contact or verifies it exists.

**Example:**
```typescript
await createCustomerIfNotExists(page, {
  firstName: "John",
  lastName: "Smith"
});
```

#### `createContact(page, contactName, contactType)`
Creates a contact with specific type(s) or verifies it exists.

**Example:**
```typescript
await createContact(page, 
  { firstName: "Dr. Jane", lastName: "Doe" }, 
  ["Vet", "Customer"]
);
```

#### `navigateToContact(page, contactName)`
Navigates to a contact's page.

**Example:**
```typescript
await navigateToContact(page, { firstName: "John", lastName: "Smith" });
```

---

## Usage in Tests

```typescript
import { test } from '@playwright/test';
import { EzyVetLoginPage } from '../pages/EzyVetLoginPage';
import { createCustomerIfNotExists } from '../helpers/contact-creation';
import { createAnimalIfNotExists } from '../helpers/animal-creation';

test('create appointment for new customer', async ({ page }) => {
  // Login
  const loginPage = new EzyVetLoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password, location);
  
  // Create customer if needed
  await createCustomerIfNotExists(page, {
    firstName: "John",
    lastName: "Smith"
  });
  
  // Create animal if needed
  await createAnimalIfNotExists(page, "Buddy", "Smith, John");
  
  // Continue with test...
});
```

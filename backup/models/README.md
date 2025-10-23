# Models Directory

This directory contains **TypeScript interfaces and types** that define the shape of data used throughout the test suite.

## 📖 Purpose

Models provide:
- Type safety for test data
- Consistent data structures
- Better IDE autocomplete
- Compile-time error checking
- Self-documenting code

## 🎯 When to Create a Model

Create models for:
- ✅ API request/response data
- ✅ Test data structures
- ✅ Form data objects
- ✅ Configuration objects
- ✅ Domain entities (User, Product, Order, etc.)

## ✍️ Model Template

```typescript
/**
 * Description of the model
 */
export interface ModelName {
  /** Field description */
  id: string;
  name: string;
  createdAt: Date;
  optional?: string;
}

/**
 * Type for creating a new model (without auto-generated fields)
 */
export type CreateModelInput = Omit<ModelName, 'id' | 'createdAt'>;

/**
 * Type for updating a model (all fields optional)
 */
export type UpdateModelInput = Partial<Omit<ModelName, 'id'>>;
```

## 📋 Example: User Model

```typescript
// models/User.ts

/**
 * Represents a user in the system
 */
export interface User {
  /** Unique user identifier */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** User's first name */
  firstName: string;
  
  /** User's last name */
  lastName: string;
  
  /** User's role in the system */
  role: UserRole;
  
  /** Account status */
  status: UserStatus;
  
  /** Phone number (optional) */
  phone?: string;
  
  /** Account creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * User role enum
 */
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

/**
 * User account status
 */
export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

/**
 * User login credentials
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Data required to create a new user
 */
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  password: string;
};

/**
 * Data for updating an existing user
 */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * User profile information
 */
export interface UserProfile {
  user: User;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

/**
 * User statistics
 */
export interface UserStatistics {
  loginCount: number;
  lastLoginAt: Date;
  totalOrders: number;
}
```

## 📋 Example: Product Model

```typescript
// models/Product.ts

/**
 * Represents a product in the catalog
 */
export interface Product {
  /** Unique product identifier */
  id: string;
  
  /** Product name */
  name: string;
  
  /** Product description */
  description: string;
  
  /** Product price in cents */
  price: number;
  
  /** Product category */
  category: ProductCategory;
  
  /** Available stock quantity */
  stock: number;
  
  /** Product SKU */
  sku: string;
  
  /** Product images */
  images: ProductImage[];
  
  /** Product attributes */
  attributes: ProductAttribute[];
  
  /** Is product active/available */
  isActive: boolean;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Product category
 */
export enum ProductCategory {
  Electronics = 'electronics',
  Clothing = 'clothing',
  Books = 'books',
  Home = 'home',
  Sports = 'sports',
  Other = 'other',
}

/**
 * Product image
 */
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

/**
 * Product attribute (size, color, etc.)
 */
export interface ProductAttribute {
  name: string;
  value: string;
}

/**
 * Data required to create a new product
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Data for updating an existing product
 */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Product search filters
 */
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchQuery?: string;
}
```

## 📋 Example: Order Model

```typescript
// models/Order.ts
import type { User } from './User';
import type { Product } from './Product';

/**
 * Represents an order in the system
 */
export interface Order {
  /** Unique order identifier */
  id: string;
  
  /** Order number (human-readable) */
  orderNumber: string;
  
  /** User who placed the order */
  userId: string;
  
  /** Order items */
  items: OrderItem[];
  
  /** Order subtotal (before tax and shipping) */
  subtotal: number;
  
  /** Tax amount */
  tax: number;
  
  /** Shipping cost */
  shipping: number;
  
  /** Order total */
  total: number;
  
  /** Order status */
  status: OrderStatus;
  
  /** Shipping address */
  shippingAddress: Address;
  
  /** Billing address */
  billingAddress: Address;
  
  /** Payment method */
  paymentMethod: PaymentMethod;
  
  /** Order notes */
  notes?: string;
  
  /** Order creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Single item in an order
 */
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/**
 * Order status enum
 */
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

/**
 * Shipping/billing address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Payment method
 */
export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal';
  last4?: string;
}

/**
 * Data required to create a new order
 */
export type CreateOrderInput = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  notes?: string;
};
```

## 🎯 Best Practices

### 1. Use Descriptive Names

```typescript
// ✅ GOOD: Clear, descriptive
export interface User {
  id: string;
  email: string;
  firstName: string;
}

// ❌ BAD: Vague, unclear
export interface Data {
  i: string;
  e: string;
  fn: string;
}
```

### 2. Document Your Models

```typescript
// ✅ GOOD: Well documented
/**
 * Represents a user in the system
 */
export interface User {
  /** Unique user identifier */
  id: string;
  
  /** User's email address (must be unique) */
  email: string;
}

// ❌ BAD: No documentation
export interface User {
  id: string;
  email: string;
}
```

### 3. Use Enums for Fixed Values

```typescript
// ✅ GOOD: Type-safe enum
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export interface User {
  role: UserRole;
}

// ❌ BAD: String literal (no autocomplete)
export interface User {
  role: string;
}
```

### 4. Create Helper Types

```typescript
// ✅ GOOD: Reusable utility types
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<Omit<User, 'id'>>;
export type UserResponse = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;

// Usage
const newUser: CreateUserInput = {
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.User,
};
```

### 5. Use Union Types for Variants

```typescript
// ✅ GOOD: Discriminated union
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface LoginResponse {
  token: string;
  user: User;
}

// Usage
const response: ApiResponse<LoginResponse> = await login(credentials);
if (response.success) {
  console.log(response.data.token); // TypeScript knows data exists
} else {
  console.error(response.error); // TypeScript knows error exists
}
```

## 📚 Using Models in Tests

```typescript
import { test, expect } from '@playwright/test';
import type { User, CreateUserInput, UserRole } from '../models/User';
import type { Product } from '../models/Product';

test('create user with valid data', async ({ request }) => {
  const newUser: CreateUserInput = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.User,
    status: UserStatus.Active,
    password: 'password123',
  };
  
  const response = await request.post('/api/users', {
    data: newUser,
  });
  
  expect(response.ok()).toBeTruthy();
  
  const user: User = await response.json();
  expect(user.email).toBe(newUser.email);
  expect(user.role).toBe(UserRole.User);
});
```

## 📚 Using Models in Page Objects

```typescript
import { Page } from '@playwright/test';
import type { User, UserCredentials } from '../models/User';

export class LoginPage {
  constructor(private page: Page) {}

  async login(credentials: UserCredentials): Promise<void> {
    await this.page.getByLabel('Email').fill(credentials.email);
    await this.page.getByLabel('Password').fill(credentials.password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async getCurrentUser(): Promise<User> {
    // Get user data from page
    const userDataElement = await this.page.locator('[data-user-info]');
    const userDataText = await userDataElement.textContent();
    return JSON.parse(userDataText!) as User;
  }
}
```

## 🎨 Naming Conventions

- Interface names: PascalCase (`User`, `Product`, `OrderItem`)
- Enum names: PascalCase (`UserRole`, `OrderStatus`)
- Enum values: PascalCase (`UserRole.Admin`, `OrderStatus.Pending`)
- Type aliases: PascalCase with descriptive suffix
  - `CreateUserInput`, `UpdateProductInput`, `UserResponse`
- File names: Match the main export (`User.ts`, `Product.ts`, `Order.ts`)

## 🔄 Exporting Models

```typescript
// models/index.ts - Central export point
export * from './User';
export * from './Product';
export * from './Order';

// Usage in tests
import { User, Product, Order, UserRole, OrderStatus } from '../models';
```




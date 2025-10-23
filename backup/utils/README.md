# Utils Directory

This directory contains **shared utility modules** that provide common functionality across the test suite.

## 📖 Purpose

Utilities provide:
- Reusable infrastructure code
- API clients for setup/teardown
- Database connections
- Logging and reporting
- Configuration management
- Common services

## 🎯 When to Create a Utility

Create utilities for:
- ✅ Infrastructure-level code (API clients, database connections)
- ✅ Cross-cutting concerns (logging, monitoring)
- ✅ Complex integrations (external services)
- ✅ Configuration management
- ✅ Shared services used by multiple tests

**Difference from Helpers:**
- **Utils**: Infrastructure and services (API client, database, logger)
- **Helpers**: Test-specific operations (login, data generation, waits)

## 📋 Example: API Client Utility

```typescript
// utils/api-client.ts
import type { User, CreateUserInput } from '../models/User';
import type { Product } from '../models/Product';

/**
 * API client for interacting with the backend
 */
export class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate and store token
   */
  async authenticate(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.authToken = data.token;
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
    };
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }

  /**
   * Create a product
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    // Close any open connections, cleanup
    this.authToken = undefined;
  }
}

/**
 * Create and return authenticated API client
 */
export async function createAuthenticatedApiClient(): Promise<ApiClient> {
  const client = new ApiClient(process.env.API_BASE_URL!);
  await client.authenticate(
    process.env.TEST_ADMIN_EMAIL!,
    process.env.TEST_ADMIN_PASSWORD!
  );
  return client;
}
```

## 📋 Example: Database Utility

```typescript
// utils/database.ts
import { Pool, PoolClient } from 'pg';

/**
 * Database client for direct database operations
 */
export class DatabaseClient {
  private pool: Pool;
  private client?: PoolClient;

  constructor(config: {
    host: string;
    port?: number;
    database: string;
    user: string;
    password: string;
  }) {
    this.pool = new Pool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.user,
      password: config.password,
    });
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    this.client = await this.pool.connect();
  }

  /**
   * Execute raw SQL query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const result = await this.client.query(sql, params);
    return result.rows;
  }

  /**
   * Clean test data from database
   */
  async cleanTestData(tableNames: string[]): Promise<void> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    for (const table of tableNames) {
      await this.client.query(`DELETE FROM ${table} WHERE id LIKE 'test-%'`);
    }
  }

  /**
   * Seed test data
   */
  async seedTestData(sql: string): Promise<void> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    await this.client.query(sql);
  }

  /**
   * Begin transaction
   */
  async beginTransaction(): Promise<void> {
    await this.client?.query('BEGIN');
  }

  /**
   * Commit transaction
   */
  async commit(): Promise<void> {
    await this.client?.query('COMMIT');
  }

  /**
   * Rollback transaction
   */
  async rollback(): Promise<void> {
    await this.client?.query('ROLLBACK');
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = undefined;
    }
    await this.pool.end();
  }
}

/**
 * Create database client from environment variables
 */
export function createDatabaseClient(): DatabaseClient {
  return new DatabaseClient({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  });
}
```

## 📋 Example: Logger Utility

```typescript
// utils/logger.ts
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Custom logger for tests
 */
export class Logger {
  private logFile?: string;

  constructor(logFile?: string) {
    this.logFile = logFile;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Console output
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // File output
    if (this.logFile) {
      const fullMessage = data 
        ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n`
        : `${logMessage}\n`;
      
      fs.appendFileSync(this.logFile, fullMessage);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log test step
   */
  step(description: string): void {
    test.step(description, async () => {
      this.info(`Test Step: ${description}`);
    });
  }
}

/**
 * Create logger instance
 */
export function createLogger(testName?: string): Logger {
  if (testName) {
    const logDir = path.join(process.cwd(), 'test-results', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `${testName}-${Date.now()}.log`);
    return new Logger(logFile);
  }
  
  return new Logger();
}

// Default logger instance
export const logger = createLogger();
```

## 📋 Example: Configuration Utility

```typescript
// utils/config.ts
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test configuration
 */
export const config = {
  // Base URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
  
  // Browser settings
  headless: process.env.HEADLESS === 'true',
  slowMo: parseInt(process.env.SLOW_MO || '0'),
  
  // Test credentials
  testUser: {
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  },
  testAdmin: {
    email: process.env.TEST_ADMIN_EMAIL!,
    password: process.env.TEST_ADMIN_PASSWORD!,
  },
  
  // Database
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },
  
  // Timeouts
  timeouts: {
    default: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
    navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '60000'),
  },
  
  // CI/CD
  isCI: process.env.CI === 'true',
  workers: parseInt(process.env.WORKERS || '2'),
  retries: parseInt(process.env.RETRIES || '0'),
  
  // Reporting
  video: process.env.VIDEO || 'retain-on-failure',
  screenshot: process.env.SCREENSHOT || 'only-on-failure',
  trace: process.env.TRACE || 'on-first-retry',
} as const;

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const required = [
    'TEST_USER_EMAIL',
    'TEST_USER_PASSWORD',
    'TEST_ADMIN_EMAIL',
    'TEST_ADMIN_PASSWORD',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }
}
```

## 📚 Using Utilities

```typescript
import { test, expect } from '@playwright/test';
import { ApiClient } from '../utils/api-client';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

test('create user via API', async ({ page }) => {
  const apiClient = new ApiClient(config.apiBaseUrl);
  
  try {
    // Authenticate
    logger.info('Authenticating API client');
    await apiClient.authenticate(config.testAdmin.email, config.testAdmin.password);
    
    // Create user
    logger.info('Creating test user');
    const user = await apiClient.createUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.User,
      status: UserStatus.Active,
      password: 'password123',
    });
    
    logger.info('User created', { userId: user.id });
    
    // Verify user exists
    await page.goto('/users');
    await expect(page.getByText(user.email)).toBeVisible();
    
  } finally {
    // Cleanup
    logger.info('Cleaning up API client');
    await apiClient.close();
  }
});
```

## 🎯 Best Practices

### 1. Make Utilities Reusable

```typescript
// ✅ GOOD: Generic, configurable
export class ApiClient {
  constructor(private baseUrl: string) {}
  
  async request(endpoint: string, options?: RequestInit) {
    return fetch(`${this.baseUrl}${endpoint}`, options);
  }
}

// ❌ BAD: Hardcoded, inflexible
export class ApiClient {
  async getUser() {
    return fetch('http://localhost:3000/api/users');
  }
}
```

### 2. Handle Errors Gracefully

```typescript
// ✅ GOOD: Proper error handling
export class ApiClient {
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error deleting user', { userId, error });
      throw error;
    }
  }
}
```

### 3. Document Public APIs

```typescript
/**
 * API client for backend operations
 * 
 * @example
 * ```typescript
 * const client = new ApiClient('http://api.example.com');
 * await client.authenticate('user@example.com', 'password');
 * const user = await client.getUser('user-123');
 * ```
 */
export class ApiClient {
  // Implementation
}
```

### 4. Clean Up Resources

```typescript
// ✅ GOOD: Cleanup method
export class DatabaseClient {
  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
    }
    await this.pool.end();
  }
}

// Usage with proper cleanup
const db = new DatabaseClient(config);
try {
  await db.connect();
  // ... operations
} finally {
  await db.disconnect();
}
```

## 🎨 Naming Conventions

- File names: Descriptive, kebab-case
  - `api-client.ts`, `database.ts`, `logger.ts`, `config.ts`
- Class names: PascalCase
  - `ApiClient`, `DatabaseClient`, `Logger`
- Function names: camelCase
  - `createApiClient()`, `validateConfig()`




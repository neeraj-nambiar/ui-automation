/**
 * Database utility for direct database operations
 * Note: Requires appropriate database driver (e.g., pg for PostgreSQL)
 * Install with: npm install -D pg @types/pg
 */

/**
 * Database client interface
 * Implement this based on your database type
 */
export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  cleanTestData(tableNames: string[]): Promise<void>;
}

/**
 * Example PostgreSQL Database Client
 * Uncomment and modify based on your database
 */
/*
import { Pool, PoolClient } from 'pg';

export class DatabaseClient implements IDatabaseClient {
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

  async connect(): Promise<void> {
    this.client = await this.pool.connect();
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected');
    }
    const result = await this.client.query(sql, params);
    return result.rows;
  }

  async cleanTestData(tableNames: string[]): Promise<void> {
    if (!this.client) {
      throw new Error('Database not connected');
    }
    for (const table of tableNames) {
      await this.client.query(`DELETE FROM ${table} WHERE id LIKE 'test-%'`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = undefined;
    }
    await this.pool.end();
  }
}
*/

/**
 * Create database client from environment variables
 */
export function createDatabaseClient(): IDatabaseClient {
  // Implement based on your database
  throw new Error('Database client not implemented. Update utils/database.ts');
}




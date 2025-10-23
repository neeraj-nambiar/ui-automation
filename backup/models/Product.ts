/**
 * Product model - Represents a product in the ezyVet system
 */

/**
 * Product category
 */
export enum ProductCategory {
  Medication = 'medication',
  Supplies = 'supplies',
  Services = 'services',
  Other = 'other',
}

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
  
  /** Is product active/available */
  isActive: boolean;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Data required to create a new product
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Data for updating an existing product
 */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;




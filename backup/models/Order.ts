/**
 * Order model - Represents an order in the ezyVet system
 */

/**
 * Order status enum
 */
export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Cancelled = 'cancelled',
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
  
  /** Order subtotal */
  subtotal: number;
  
  /** Tax amount */
  tax: number;
  
  /** Order total */
  total: number;
  
  /** Order status */
  status: OrderStatus;
  
  /** Order notes */
  notes?: string;
  
  /** Order creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
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
  notes?: string;
};




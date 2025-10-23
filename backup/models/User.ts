/**
 * User model - Represents a user in the ezyVet system
 */

/**
 * User role enum
 */
export enum UserRole {
  Admin = 'admin',
  Veterinarian = 'veterinarian',
  Nurse = 'nurse',
  Receptionist = 'receptionist',
  User = 'user',
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




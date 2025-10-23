/**
 * API Client utility for backend operations
 * Used for test setup and teardown via API calls
 */

export class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate and store token
   * @param email - User email
   * @param password - User password
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
   * Make a GET request
   * @param endpoint - API endpoint
   * @returns Response data
   */
  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GET ${endpoint} failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Make a POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Response data
   */
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`POST ${endpoint} failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Make a PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Response data
   */
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`PUT ${endpoint} failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Make a DELETE request
   * @param endpoint - API endpoint
   */
  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`DELETE ${endpoint} failed: ${response.statusText}`);
    }
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    this.authToken = undefined;
  }
}

/**
 * Create and return authenticated API client
 */
export async function createAuthenticatedApiClient(
  baseUrl?: string,
  email?: string,
  password?: string
): Promise<ApiClient> {
  const client = new ApiClient(baseUrl || process.env.API_BASE_URL!);
  await client.authenticate(
    email || process.env.TEST_ADMIN_EMAIL!,
    password || process.env.TEST_ADMIN_PASSWORD!
  );
  return client;
}




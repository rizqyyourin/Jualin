/**
 * API Configuration
 * Centralized API endpoint configuration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_URL,
  endpoints: {
    // Auth endpoints
    auth: {
      login: `${API_URL}/auth/login`,
      register: `${API_URL}/auth/register`,
      logout: `${API_URL}/auth/logout`,
      me: `${API_URL}/auth/me`,
      refresh: `${API_URL}/auth/refresh`,
    },
    // Product endpoints
    products: {
      list: `${API_URL}/products`,
      detail: (id: string | number) => `${API_URL}/products/${id}`,
      create: `${API_URL}/products`,
      update: (id: string | number) => `${API_URL}/products/${id}`,
      delete: (id: string | number) => `${API_URL}/products/${id}`,
    },
    // Category endpoints
    categories: {
      list: `${API_URL}/categories`,
      detail: (id: string | number) => `${API_URL}/categories/${id}`,
    },
    // Cart endpoints
    cart: {
      list: `${API_URL}/cart`,
      add: `${API_URL}/cart`,
      update: (id: string | number) => `${API_URL}/cart/${id}`,
      remove: (id: string | number) => `${API_URL}/cart/${id}`,
    },
    // Wishlist endpoints
    wishlist: {
      list: `${API_URL}/wishlist`,
      add: `${API_URL}/wishlist`,
      remove: (id: string | number) => `${API_URL}/wishlist/${id}`,
    },
    // Order endpoints
    orders: {
      list: `${API_URL}/orders`,
      detail: (id: string | number) => `${API_URL}/orders/${id}`,
      create: `${API_URL}/orders`,
    },
    // Review endpoints
    reviews: {
      list: (productId: string | number) => `${API_URL}/products/${productId}/reviews`,
      create: (productId: string | number) => `${API_URL}/products/${productId}/reviews`,
    },
  },
};

/**
 * Default fetch options with headers
 */
export function getFetchOptions(method = 'GET', token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    method,
    headers,
    credentials: 'include' as RequestCredentials,
  };
}

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const response = await fetch(url, {
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      data: null,
      error: errorMessage,
      status: 0,
    };
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default apiConfig;

/**
 * Cart API Service
 * Centralized API calls for shopping cart operations
 */

import apiClient from '../api';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    image?: string;
    stock?: {
      quantity: number;
    };
  };
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  discount_code?: string;
  discount_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyDiscountRequest {
  coupon_code: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

/**
 * Get user's cart
 */
export async function getCart(): Promise<ApiResponse<Cart>> {
  try {
    const response = await apiClient.get<ApiResponse<Cart>>('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  data: AddToCartRequest
): Promise<ApiResponse<CartItem>> {
  try {
    const response = await apiClient.post<ApiResponse<CartItem>>(
      '/cart/items',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  itemId: number,
  data: UpdateCartItemRequest
): Promise<ApiResponse<CartItem>> {
  try {
    const response = await apiClient.put<ApiResponse<CartItem>>(
      `/cart/items/${itemId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating cart item ${itemId}:`, error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: number): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/cart/items/${itemId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error removing item from cart:`, error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>('/cart');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

/**
 * Apply discount coupon
 */
export async function applyDiscount(
  data: ApplyDiscountRequest
): Promise<ApiResponse<Cart>> {
  try {
    const response = await apiClient.post<ApiResponse<Cart>>(
      '/cart/discount',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error applying discount:', error);
    throw error;
  }
}

/**
 * Remove discount from cart
 */
export async function removeDiscount(): Promise<ApiResponse<Cart>> {
  try {
    const response = await apiClient.delete<ApiResponse<Cart>>('/cart/discount');
    return response.data;
  } catch (error) {
    console.error('Error removing discount:', error);
    throw error;
  }
}

// Export as service object for consistency
export const cartAPI = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
};

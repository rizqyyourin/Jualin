import { create } from 'zustand';
import { cartAPI, Cart, CartItem } from '../api/cart';

interface CartStore {
  // State
  cart: Cart | null;
  loading: boolean;
  error: Error | null;
  message: string | null;
  isInitialized: boolean;

  // Actions
  loadCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyDiscount: (couponCode: string) => Promise<void>;
  removeDiscount: () => Promise<void>;
  resetCart: () => void;
  clearMessage: () => void;

  // Computed
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Initial state
  cart: null,
  loading: false,
  error: null,
  message: null,
  isInitialized: false,

  // Load cart from API
  loadCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await cartAPI.getCart();
      set({ cart: response.data, isInitialized: true });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error, isInitialized: true });
      console.error('Failed to load cart:', error.message);
    } finally {
      set({ loading: false });
    }
  },

  // Add item to cart
  addItem: async (productId: number, quantity: number) => {
    set({ error: null });
    try {
      await cartAPI.addToCart({ product_id: productId, quantity });
      // Refresh cart
      const response = await cartAPI.getCart();
      set({ cart: response.data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error });
      console.error('Failed to add item:', error.message);
    }
  },

  // Remove item from cart
  removeItem: async (itemId: number) => {
    set({ error: null });
    try {
      await cartAPI.removeFromCart(itemId);
      // Refresh cart
      const response = await cartAPI.getCart();
      set({ cart: response.data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error });
      console.error('Failed to remove item:', error.message);
    }
  },

  // Update item quantity
  updateQuantity: async (itemId: number, quantity: number) => {
    set({ error: null, message: null });
    try {
      if (quantity <= 0) {
        await cartAPI.removeFromCart(itemId);
      } else {
        await cartAPI.updateCartItem(itemId, { quantity });
      }
      // Refresh cart
      const response = await cartAPI.getCart();
      set({ cart: response.data, message: 'Cart updated successfully' });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update cart';
      const error = new Error(errorMessage);
      set({ error, message: errorMessage });
      console.error('Failed to update quantity:', errorMessage);
      // Reload cart to sync with server state
      try {
        const response = await cartAPI.getCart();
        set({ cart: response.data });
      } catch (reloadErr) {
        console.error('Failed to reload cart:', reloadErr);
      }
    }
  },

  // Clear entire cart
  clearCart: async () => {
    set({ error: null });
    try {
      await cartAPI.clearCart();
      set({ cart: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error });
      console.error('Failed to clear cart:', error.message);
    }
  },

  // Apply discount coupon
  applyDiscount: async (couponCode: string) => {
    set({ error: null });
    try {
      const response = await cartAPI.applyDiscount({ coupon_code: couponCode });
      set({ cart: response.data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error });
      console.error('Failed to apply discount:', error.message);
    }
  },

  // Remove discount from cart
  removeDiscount: async () => {
    set({ error: null });
    try {
      const response = await cartAPI.removeDiscount();
      set({ cart: response.data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      set({ error });
      console.error('Failed to remove discount:', error.message);
    }
  },

  // Reset local cart state (without API call)
  resetCart: () => {
    set({ cart: null, error: null, message: null, isInitialized: false });
  },

  // Clear message
  clearMessage: () => {
    set({ message: null, error: null });
  },

  // Get total price
  getTotalPrice: () => {
    const state = get();
    return state.cart?.total ?? 0;
  },

  // Get total items count
  getTotalItems: () => {
    const state = get();
    if (!state.cart?.items) return 0;
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  },
}));

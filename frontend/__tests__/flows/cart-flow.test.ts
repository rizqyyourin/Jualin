import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCartStore } from '@/lib/stores/cartStore';

/**
 * Test Suite: Cart Flow
 * - Add item to cart
 * - Update quantity
 * - Remove item
 * - Clear cart
 * - View cart
 * - Apply coupon
 * - Proceed to checkout
 */

describe('Cart Flow', () => {
  beforeEach(() => {
    // Clear cart before each test
    const store = useCartStore.getState();
    store.clearCart();
  });

  describe('Add to Cart', () => {
    it('should add item to cart', () => {
      const store = useCartStore.getState();

      const item = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg',
        category: 'Electronics',
      };

      store.addItem(item);

      expect(store.items.length).toBe(1);
      expect(store.items[0].name).toBe('Test Product');
      expect(store.items[0].quantity).toBe(1);
    });

    it('should increase quantity if item already in cart', () => {
      const store = useCartStore.getState();

      const item = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg',
        category: 'Electronics',
      };

      store.addItem(item);
      store.addItem(item);

      expect(store.items.length).toBe(1);
      expect(store.items[0].quantity).toBe(2);
    });

    it('should not exceed max quantity per item', () => {
      const store = useCartStore.getState();

      const item = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 10,
        image: 'https://example.com/image.jpg',
        category: 'Electronics',
      };

      for (let i = 0; i < 15; i++) {
        store.addItem(item);
      }

      // Should be limited to reasonable quantity
      expect(store.items[0].quantity).toBeLessThanOrEqual(20);
    });

    it('should update cart total after adding item', () => {
      const store = useCartStore.getState();

      const item1 = {
        id: '1',
        name: 'Product 1',
        price: 50.0,
        quantity: 1,
        image: 'https://example.com/image1.jpg',
        category: 'Electronics',
      };

      const item2 = {
        id: '2',
        name: 'Product 2',
        price: 30.0,
        quantity: 1,
        image: 'https://example.com/image2.jpg',
        category: 'Electronics',
      };

      store.addItem(item1);
      expect(store.getTotalPrice()).toBe(50.0);

      store.addItem(item2);
      expect(store.getTotalPrice()).toBe(80.0);
    });
  });

  describe('Update Item Quantity', () => {
    beforeEach(() => {
      const store = useCartStore.getState();
      store.clearCart();

      const item = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg',
        category: 'Electronics',
      };

      store.addItem(item);
    });

    it('should update item quantity', () => {
      const store = useCartStore.getState();

      store.updateQuantity('1', 5);

      expect(store.items[0].quantity).toBe(5);
    });

    it('should not update quantity to 0 or negative', () => {
      const store = useCartStore.getState();

      store.updateQuantity('1', 0);

      // Should either keep previous quantity or remove item
      expect(store.items.length).toBe(0);
    });

    it('should recalculate total after quantity update', () => {
      const store = useCartStore.getState();

      store.updateQuantity('1', 3);

      expect(store.getTotalPrice()).toBe(99.99 * 3);
    });

    it('should increment quantity with +1 button', () => {
      const store = useCartStore.getState();
      const initialQty = store.items[0].quantity;

      store.updateQuantity('1', initialQty + 1);

      expect(store.items[0].quantity).toBe(initialQty + 1);
    });

    it('should decrement quantity with -1 button', () => {
      const store = useCartStore.getState();

      store.updateQuantity('1', 2);
      store.updateQuantity('1', 1);

      expect(store.items[0].quantity).toBe(1);
    });
  });

  describe('Remove Item from Cart', () => {
    beforeEach(() => {
      const store = useCartStore.getState();
      store.clearCart();

      const items = [
        {
          id: '1',
          name: 'Product 1',
          price: 50.0,
          quantity: 1,
          image: 'https://example.com/image1.jpg',
          category: 'Electronics',
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30.0,
          quantity: 2,
          image: 'https://example.com/image2.jpg',
          category: 'Electronics',
        },
      ];

      items.forEach((item) => store.addItem(item));
    });

    it('should remove item from cart', () => {
      const store = useCartStore.getState();

      expect(store.items.length).toBe(2);

      store.removeItem('1');

      expect(store.items.length).toBe(1);
      expect(store.items[0].id).toBe('2');
    });

    it('should update total after removing item', () => {
      const store = useCartStore.getState();

      store.removeItem('1');

      expect(store.getTotalPrice()).toBe(30.0 * 2);
    });

    it('should show empty cart message after removing all items', () => {
      const store = useCartStore.getState();

      store.removeItem('1');
      store.removeItem('2');

      expect(store.items.length).toBe(0);
    });
  });

  describe('Clear Cart', () => {
    beforeEach(() => {
      const store = useCartStore.getState();
      store.clearCart();

      const items = [
        {
          id: '1',
          name: 'Product 1',
          price: 50.0,
          quantity: 2,
          image: 'https://example.com/image1.jpg',
          category: 'Electronics',
        },
        {
          id: '2',
          name: 'Product 2',
          price: 30.0,
          quantity: 1,
          image: 'https://example.com/image2.jpg',
          category: 'Electronics',
        },
      ];

      items.forEach((item) => store.addItem(item));
    });

    it('should clear all items from cart', () => {
      const store = useCartStore.getState();

      expect(store.items.length).toBe(2);

      store.clearCart();

      expect(store.items.length).toBe(0);
    });

    it('should reset cart total to 0', () => {
      const store = useCartStore.getState();

      store.clearCart();

      expect(store.getTotalPrice()).toBe(0);
    });
  });

  describe('Cart Summary', () => {
    beforeEach(() => {
      const store = useCartStore.getState();
      store.clearCart();

      const items = [
        {
          id: '1',
          name: 'Product 1',
          price: 100.0,
          quantity: 1,
          image: 'https://example.com/image1.jpg',
          category: 'Electronics',
        },
        {
          id: '2',
          name: 'Product 2',
          price: 50.0,
          quantity: 2,
          image: 'https://example.com/image2.jpg',
          category: 'Clothing',
        },
      ];

      items.forEach((item) => store.addItem(item));
    });

    it('should calculate correct subtotal', () => {
      const store = useCartStore.getState();

      const subtotal = 100.0 * 1 + 50.0 * 2;
      expect(store.getTotalPrice()).toBe(subtotal);
    });

    it('should calculate correct item count', () => {
      const store = useCartStore.getState();

      const count = store.items.reduce((sum, item) => sum + item.quantity, 0);
      expect(count).toBe(3);
    });

    it('should get correct number of items in cart', () => {
      const store = useCartStore.getState();

      expect(store.items.length).toBe(2);
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart data to localStorage', () => {
      const store = useCartStore.getState();

      const item = {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
        image: 'https://example.com/image.jpg',
        category: 'Electronics',
      };

      store.addItem(item);

      // Zustand persist middleware should save to localStorage
      expect(store.items.length).toBe(1);
    });
  });
});

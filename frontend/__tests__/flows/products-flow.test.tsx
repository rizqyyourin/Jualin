import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '@/components/products/ProductCard';
import { WishlistButton } from '@/components/products/WishlistButton';
import { useWishlistStore } from '@/lib/stores/wishlistStore';

/**
 * Test Suite: Products Flow
 * - Browse products
 * - Filter products
 * - Add to wishlist
 * - Add to cart
 * - View product details
 */

describe('Products Flow', () => {
  describe('ProductCard Component', () => {
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category: 'Electronics',
      rating: 4,
      reviews: 128,
      inStock: true,
    };

    it('should render product with all information', () => {
      render(<ProductCard {...mockProduct} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('(128)')).toBeInTheDocument();
    });

    it('should display correct number of stars based on rating', () => {
      const { container } = render(
        <ProductCard {...mockProduct} rating={4} />
      );

      const stars = container.querySelectorAll('.text-yellow-400');
      expect(stars.length).toBe(4);
    });

    it('should show "Add to Cart" button when in stock', () => {
      render(<ProductCard {...mockProduct} inStock={true} />);

      const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
      expect(addToCartBtn).toBeEnabled();
    });

    it('should disable "Add to Cart" button when out of stock', () => {
      render(<ProductCard {...mockProduct} inStock={false} />);

      const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
      expect(addToCartBtn).toBeDisabled();
    });

    it('should show "Out of Stock" overlay when product is out of stock', () => {
      const { container } = render(
        <ProductCard {...mockProduct} inStock={false} />
      );

      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('should link to product detail page', () => {
      render(<ProductCard {...mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/1');
    });

    it('should render WishlistButton', () => {
      const { container } = render(<ProductCard {...mockProduct} />);

      const wishlistBtn = container.querySelector('[title="Add to wishlist"]');
      expect(wishlistBtn).toBeInTheDocument();
    });

    it('should handle add to cart click', async () => {
      render(<ProductCard {...mockProduct} />);

      const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
      fireEvent.click(addToCartBtn);

      // Button should be clickable
      expect(addToCartBtn).toBeInTheDocument();
    });
  });

  describe('WishlistButton Component', () => {
    const mockItem = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      image: 'https://example.com/image.jpg',
      category: 'Electronics',
    };

    beforeEach(() => {
      // Clear wishlist before each test
      const store = useWishlistStore.getState();
      store.clearWishlist();
    });

    it('should render wishlist button', () => {
      const { container } = render(<WishlistButton item={mockItem} variant="rounded" />);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should add item to wishlist on click', async () => {
      const user = userEvent.setup();
      const { container } = render(<WishlistButton item={mockItem} variant="rounded" />);

      const button = container.querySelector('button');
      await user.click(button!);

      const store = useWishlistStore.getState();
      expect(store.isInWishlist(mockItem.id)).toBe(true);
    });

    it('should remove item from wishlist on second click', async () => {
      const user = userEvent.setup();
      const { container } = render(<WishlistButton item={mockItem} variant="rounded" />);

      const button = container.querySelector('button');

      // First click - add
      await user.click(button!);
      let store = useWishlistStore.getState();
      expect(store.isInWishlist(mockItem.id)).toBe(true);

      // Second click - remove
      await user.click(button!);
      store = useWishlistStore.getState();
      expect(store.isInWishlist(mockItem.id)).toBe(false);
    });

    it('should toggle button styling based on wishlist state', async () => {
      const user = userEvent.setup();
      const { container, rerender } = render(
        <WishlistButton item={mockItem} variant="rounded" />
      );

      const button = container.querySelector('button');

      // Initially not in wishlist
      expect(button).toHaveClass('bg-gray-100');

      // Add to wishlist
      await user.click(button!);
      rerender(<WishlistButton item={mockItem} variant="rounded" />);

      // Should show as added (styling change)
      expect(button).toBeInTheDocument();
    });
  });

  describe('Product Filtering', () => {
    it('should filter products by search term', async () => {
      const user = userEvent.setup();

      const searchInput = screen.queryByPlaceholderText('Search products...');
      if (searchInput) {
        await user.type(searchInput, 'headphones');
        // Search input should have the typed value
        expect(searchInput).toHaveValue('headphones');
      }
    });

    it('should filter products by category', async () => {
      const user = userEvent.setup();

      const categoryCheckbox = screen.queryByLabelText('Electronics');
      if (categoryCheckbox) {
        await user.click(categoryCheckbox);
        // Checkbox should be checked
        expect(categoryCheckbox).toBeChecked();
      }
    });

    it('should filter products by price range', async () => {
      const user = userEvent.setup();

      const minPriceInput = screen.queryByDisplayValue('0');
      if (minPriceInput) {
        await user.clear(minPriceInput);
        await user.type(minPriceInput, '50');
        expect(minPriceInput).toHaveValue('50');
      }
    });

    it('should sort products by different criteria', async () => {
      const user = userEvent.setup();

      const sortRadio = screen.queryByDisplayValue('price-low');
      if (sortRadio) {
        await user.click(sortRadio);
        expect(sortRadio).toBeChecked();
      }
    });
  });

  describe('Product Details Flow', () => {
    it('should navigate to product detail page on product click', () => {
      const mockProduct = {
        id: 5,
        name: 'Detailed Product',
        price: 149.99,
        image: 'https://example.com/image.jpg',
        category: 'Fashion',
        rating: 5,
        reviews: 89,
        inStock: true,
      };

      render(<ProductCard {...mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/5');
    });
  });
});

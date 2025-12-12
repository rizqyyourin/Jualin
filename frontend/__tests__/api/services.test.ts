/**
 * Test Suite: API Service Layer Integration
 * Tests to verify that API services correctly wrap the backend endpoints
 */

import { productAPI, categoryAPI } from '@/lib/api/products';

const API_URL = 'http://localhost:8000/api';

describe('API Service Layer Integration', () => {
  describe('Product Service - getProducts()', () => {
    it('should fetch products with default pagination', async () => {
      const response = await productAPI.getProducts();

      expect(response.message).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });

    it('should return products with all required fields', async () => {
      const response = await productAPI.getProducts();

      response.data.data.forEach((product: any) => {
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.category_id).toBeDefined();
        expect(product.slug).toBeDefined();
        expect(product.sku).toBeDefined();
        expect(product.status).toBe('active');
      });
    });

    it('should support pagination with page parameter', async () => {
      const page1 = await productAPI.getProducts(1, 15);
      const page2 = await productAPI.getProducts(2, 15);

      expect(page1.data.current_page).toBe(1);
      expect(page2.data.current_page).toBe(2);
      expect(page1.data.data.length).toBeGreaterThan(0);
    });

    it('should support filtering by category', async () => {
      const firstProduct = await productAPI.getProducts();
      const categoryId = firstProduct.data.data[0].category_id;

      const filtered = await productAPI.getProducts(1, 15, categoryId);

      expect(filtered.data.data.length).toBeGreaterThan(0);
    });

    it('should return pagination metadata', async () => {
      const response = await productAPI.getProducts();

      expect(response.data.current_page).toBe(1);
      expect(response.data.total).toBeGreaterThan(0);
      expect(response.data.per_page).toBe(15);
      expect(response.data.last_page).toBeGreaterThan(0);
    });
  });

  describe('Product Service - getProduct()', () => {
    it('should fetch a single product by ID', async () => {
      const response = await productAPI.getProduct(1);

      expect(response.message).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(1);
    });

    it('should return product with detailed information', async () => {
      const response = await productAPI.getProduct(1);

      expect(response.data.id).toBeDefined();
      expect(response.data.name).toBeDefined();
      expect(response.data.description).toBeDefined();
      expect(response.data.price).toBeDefined();
      expect(response.data.sku).toBeDefined();
      expect(response.data.category_id).toBeDefined();
    });

    it('should include stock information', async () => {
      const response = await productAPI.getProduct(1);

      expect(response.data.stock).toBeDefined();
      expect(response.data.stock?.quantity).toBeDefined();
      expect(response.data.stock?.reorder_level).toBeDefined();
    });

    it('should throw error for non-existent product', async () => {
      try {
        await productAPI.getProduct(99999);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Product Service - getProductReviews()', () => {
    it('should fetch reviews for a product', async () => {
      const response = await productAPI.getProductReviews(1);

      expect(response.message).toBeDefined();
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data.data)).toBe(true);
    });

    it('should return reviews with required fields', async () => {
      const response = await productAPI.getProductReviews(1);

      if (response.data.data.length > 0) {
        const review = response.data.data[0];
        expect(review.id).toBeDefined();
        expect(review.product_id).toBe(1);
        expect(review.rating).toBeDefined();
        expect(review.comment).toBeDefined();
        expect(review.user).toBeDefined();
      }
    });

    it('should include user information with reviews', async () => {
      const response = await productAPI.getProductReviews(1);

      if (response.data.data.length > 0) {
        const review = response.data.data[0];
        expect(review.user?.id).toBeDefined();
        expect(review.user?.name).toBeDefined();
        expect(review.user?.email).toBeDefined();
      }
    });

    it('should support pagination', async () => {
      const response = await productAPI.getProductReviews(1, 1);

      expect(response.data.current_page).toBe(1);
    });
  });

  describe('Category Service - getCategories()', () => {
    it('should fetch all categories', async () => {
      const response = await categoryAPI.getCategories();

      expect(response.message).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.data).toBeDefined();
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBe(6);
    });

    it('should return categories with required fields', async () => {
      const response = await categoryAPI.getCategories();

      response.data.data.forEach((category: any) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.is_active).toBe(true);
      });
    });

    it('should have proper category names from seeder', async () => {
      const response = await categoryAPI.getCategories();

      const names = response.data.data.map((c: any) => c.name);
      expect(names).toContain('Electronics');
      expect(names).toContain('Audio & Headphones');
      expect(names).toContain('Computing');
      expect(names).toContain('Peripherals');
      expect(names).toContain('Displays');
      expect(names).toContain('Accessories');
    });
  });

  describe('Category Service - getCategory()', () => {
    it('should fetch a single category by ID', async () => {
      const response = await categoryAPI.getCategory(1);

      expect(response.message).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Electronics');
    });

    it('should return category with all fields', async () => {
      const response = await categoryAPI.getCategory(1);

      expect(response.data.id).toBeDefined();
      expect(response.data.name).toBeDefined();
      expect(response.data.slug).toBeDefined();
      expect(response.data.is_active).toBe(true);
    });
  });

  describe('Service Layer - Response Consistency', () => {
    it('product service responses should match API integration test format', async () => {
      const products = await productAPI.getProducts();
      const singleProduct = await productAPI.getProduct(1);

      // Both should have same structure
      expect(products.message).toBeDefined();
      expect(singleProduct.message).toBeDefined();
      expect(products.data.data).toBeDefined();
      expect(singleProduct.data).toBeDefined();
    });

    it('category service should return same structure as API tests', async () => {
      const response = await categoryAPI.getCategories();

      // Response structure should match API test expectations
      expect(response.data.current_page).toBe(1);
      expect(response.data.per_page).toBeDefined();
      expect(response.data.total).toBeGreaterThan(0);
    });

    it('service layer should properly handle pagination', async () => {
      const response = await productAPI.getProducts(1, 10);

      expect(response.data.per_page).toBe(10);
      expect(response.data.data.length).toBeLessThanOrEqual(10);
    });
  });
});

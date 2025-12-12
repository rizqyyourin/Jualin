/**
 * Test Suite: Categories API Integration
 * Tests to verify frontend correctly consumes /api/categories endpoints
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api';

describe('Categories API Integration', () => {
  describe('GET /api/categories - List Categories', () => {
    it('should fetch all categories successfully', async () => {
      const response = await fetch(`${API_URL}/categories`);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBeDefined();
      expect(data.data).toBeDefined();
      expect(data.data.data).toBeDefined();
      expect(Array.isArray(data.data.data)).toBe(true);
      expect(data.data.data.length).toBeGreaterThan(0);
    });

    it('should return categories with required fields', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      expect(data.data.data.length).toBeGreaterThanOrEqual(6);

      data.data.data.forEach((category: any) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
        expect(category.is_active).toBe(true);
      });
    });

    it('should have specific categories from seeder', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      const categoryNames = data.data.data.map((c: any) => c.name);

      expect(categoryNames).toContain('Electronics');
      expect(categoryNames).toContain('Audio & Headphones');
      expect(categoryNames).toContain('Computing');
      expect(categoryNames).toContain('Peripherals');
      expect(categoryNames).toContain('Displays');
      expect(categoryNames).toContain('Accessories');
    });

    it('should have proper slugs for categories', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      data.data.data.forEach((category: any) => {
        expect(category.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('should have descriptions for categories', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      data.data.data.forEach((category: any) => {
        expect(category.description).toBeDefined();
        expect(category.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have exactly 6 categories from seeder', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      expect(data.data.data.length).toBe(6);
    });

    it('all categories should be active', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      data.data.data.forEach((category: any) => {
        expect(category.is_active).toBe(true);
      });
    });

    it('should have unique category IDs', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      const ids = data.data.data.map((c: any) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique category slugs', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      const slugs = data.data.data.map((c: any) => c.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });


  describe('Frontend Ready Checks', () => {
    it('categories response format suitable for CategoryList component', async () => {
      const response = await fetch(`${API_URL}/categories`);
      const data = await response.json();

      // Frontend needs array of categories
      expect(Array.isArray(data.data.data)).toBe(true);

      if (data.data.data.length > 0) {
        const category = data.data.data[0];
        // CategoryCard component needs these
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.slug).toBeDefined();
      }
    });

    it('categories can be used for filtering products', async () => {
      const catRes = await fetch(`${API_URL}/categories`);
      const catData = await catRes.json();
      const categoryId = catData.data.data[0].id;

      // Should be able to filter products by this category
      const prodRes = await fetch(`${API_URL}/products?category=${categoryId}`);
      const prodData = await prodRes.json();

      expect(prodRes.status).toBe(200);
      if (prodData.data.data.length > 0) {
        expect(prodData.data.data[0].category_id).toBeDefined();
      }
    });
  });
});

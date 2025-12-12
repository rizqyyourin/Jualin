import apiClient from '../api';

export interface RecommendedProduct {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  rating?: number;
  reason?: string; // e.g., "Similar product", "Customers also bought", "Popular in your category"
}

export interface RecommendationParams {
  productId: string | number;
  limit?: number;
  type?: 'similar' | 'trending' | 'bestsellers' | 'category';
}

// Recommendations API Service
export const recommendationAPI = {
  // Get recommendations for a product
  getRecommendations: async (params: RecommendationParams): Promise<RecommendedProduct[]> => {
    try {
      const { productId, limit = 6, type = 'similar' } = params;
      const response = await apiClient.get(`/products/${productId}/recommendations`, {
        params: { limit, type },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Get trending products
  getTrendingProducts: async (limit: number = 6): Promise<RecommendedProduct[]> => {
    try {
      const response = await apiClient.get('/products/trending', { params: { limit } });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      throw error;
    }
  },

  // Get bestselling products
  getBestsellerProducts: async (limit: number = 6): Promise<RecommendedProduct[]> => {
    try {
      const response = await apiClient.get('/products/bestsellers', { params: { limit } });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching bestsellers:', error);
      throw error;
    }
  },

  // Get products in same category
  getProductsByCategory: async (
    category: string,
    limit: number = 6
  ): Promise<RecommendedProduct[]> => {
    try {
      const response = await apiClient.get('/products', {
        params: { category, limit },
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  },
};

// Mock recommendations generator
export function generateMockRecommendations(
  productId: string | number,
  type: 'similar' | 'trending' | 'bestsellers' | 'category' = 'similar'
): RecommendedProduct[] {
  const baseProducts = [
    {
      id: Math.random() * 1000,
      name: 'Premium Wireless Earbuds',
      price: 149.99,
      category: 'Electronics',
      rating: 4.6,
      image: '/placeholder-earbuds.jpg',
    },
    {
      id: Math.random() * 1000,
      name: 'Charging Case for Headphones',
      price: 49.99,
      category: 'Electronics',
      rating: 4.4,
      image: '/placeholder-case.jpg',
    },
    {
      id: Math.random() * 1000,
      name: 'Portable Bluetooth Speaker',
      price: 89.99,
      category: 'Electronics',
      rating: 4.5,
      image: '/placeholder-speaker.jpg',
    },
    {
      id: Math.random() * 1000,
      name: 'Audio Cable 3.5mm Jack',
      price: 12.99,
      category: 'Electronics',
      rating: 4.2,
      image: '/placeholder-cable.jpg',
    },
    {
      id: Math.random() * 1000,
      name: 'Headphone Stand',
      price: 24.99,
      category: 'Electronics',
      rating: 4.7,
      image: '/placeholder-stand.jpg',
    },
    {
      id: Math.random() * 1000,
      name: 'Noise Isolating Earpads',
      price: 19.99,
      category: 'Electronics',
      rating: 4.3,
      image: '/placeholder-pads.jpg',
    },
  ];

  const reasons: Record<string, string> = {
    similar: 'Customers who viewed this also looked at',
    trending: 'Trending right now',
    bestsellers: 'Best seller in this category',
    category: 'More in this category',
  };

  return baseProducts.map((product) => ({
    ...product,
    reason: reasons[type],
  }));
}

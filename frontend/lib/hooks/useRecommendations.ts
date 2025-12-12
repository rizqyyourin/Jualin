'use client';

import { useEffect, useState } from 'react';
import {
  recommendationAPI,
  RecommendedProduct,
  RecommendationParams,
  generateMockRecommendations,
} from '../api/recommendations';

export interface UseRecommendationsReturn {
  recommendations: RecommendedProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRecommendations = (params: RecommendationParams): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await recommendationAPI.getRecommendations(params);
      setRecommendations(data);
    } catch (err) {
      console.log('API Error, using mock recommendations:', err);
      // Use mock data on any error (404, network error, etc.)
      const mockData = generateMockRecommendations(
        params.productId,
        params.type || 'similar'
      );
      setRecommendations(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [params.productId, params.type, params.limit]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  };
};

export const useTrendingProducts = (limit: number = 6) => {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await recommendationAPI.getTrendingProducts(limit);
        setProducts(data);
      } catch (err) {
        // Mock data
        setProducts(generateMockRecommendations('0', 'trending'));
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  return { products, loading, error };
};

export const useBestsellerProducts = (limit: number = 6) => {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        const data = await recommendationAPI.getBestsellerProducts(limit);
        setProducts(data);
      } catch (err) {
        // Mock data
        setProducts(generateMockRecommendations('0', 'bestsellers'));
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, [limit]);

  return { products, loading, error };
};

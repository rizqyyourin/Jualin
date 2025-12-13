import apiClient from '../api';

export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  user_name?: string;
  rating: number;
  title?: string;
  comment: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  helpful_count?: number;
  unhelpful_count?: number;
  user_vote?: 'helpful' | 'unhelpful' | null;
  verified_purchase?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReviewData {
  product_id: number;
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number; // rating: count
  };
}

export interface ApiPaginatedResponse<T> {
  message: string;
  data: {
    current_page: number;
    data: T[];
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

// Review API Service
export const reviewAPI = {
  // Get reviews for a product
  getProductReviews: async (
    productId: number,
    page: number = 1
  ): Promise<ApiPaginatedResponse<ProductReview>> => {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<ProductReview>>(
        `/products/${productId}/reviews`,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Get review statistics for a product
  getReviewStats: async (productId: number): Promise<ApiResponse<ReviewStats>> => {
    try {
      const response = await apiClient.get<ApiResponse<ReviewStats>>(
        `/products/${productId}/reviews/stats`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching review stats for product ${productId}:`, error);
      throw error;
    }
  },

  // Create a review
  createReview: async (
    data: CreateReviewData
  ): Promise<ApiResponse<ProductReview>> => {
    try {
      const response = await apiClient.post<ApiResponse<ProductReview>>(
        '/reviews',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (
    id: number,
    data: Partial<CreateReviewData>
  ): Promise<ApiResponse<ProductReview>> => {
    try {
      const response = await apiClient.put<ApiResponse<ProductReview>>(
        `/reviews/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating review ${id}:`, error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/reviews/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting review ${id}:`, error);
      throw error;
    }
  },

  // Mark review as helpful
  markHelpful: async (id: number): Promise<ApiResponse<ProductReview>> => {
    try {
      const response = await apiClient.post<ApiResponse<ProductReview>>(
        `/reviews/${id}/helpful`
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking review ${id} as helpful:`, error);
      throw error;
    }
  },

  // Mark review as unhelpful
  markUnhelpful: async (id: number): Promise<ApiResponse<ProductReview>> => {
    try {
      const response = await apiClient.post<ApiResponse<ProductReview>>(
        `/reviews/${id}/unhelpful`
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking review ${id} as unhelpful:`, error);
      throw error;
    }
  },
};

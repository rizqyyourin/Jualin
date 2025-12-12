import apiClient from '../api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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

export const categoryAPI = {
  // Get all categories
  getCategories: async (): Promise<ApiPaginatedResponse<Category>> => {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<Category>>(
        '/categories',
        { params: { per_page: 100 } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategory: async (id: number) => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },
};

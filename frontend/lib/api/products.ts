import apiClient from '../api';

// Product Types (aligned with backend API schema)
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  cost_price?: number;
  category_id: number;
  sku: string;
  status: 'active' | 'inactive' | 'draft';
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  image?: string;
  images?: string[];
}

export interface ProductDetail extends Product {
  stock?: {
    quantity: number;
    reorder_level: number;
  };
  reviews?: Review[];
}

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

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

// API Response Types (backend returns { message, data: { current_page, data: [...] } })
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

// Product API Service
export const productAPI = {
  // Get all products with pagination and filtering
  getProducts: async (
    page: number = 1,
    perPage: number = 15,
    categoryId?: number,
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    inStockOnly?: boolean
  ): Promise<ApiPaginatedResponse<Product>> => {
    try {
      const params: Record<string, any> = {
        page,
        per_page: perPage,
      };

      if (categoryId) {
        params.category = categoryId;
      }

      if (search) {
        params.search = search;
      }

      if (minPrice !== undefined) {
        params.min_price = minPrice;
      }

      if (maxPrice !== undefined) {
        params.max_price = maxPrice;
      }

      if (sortBy) {
        params.sort = sortBy;
      }

      if (inStockOnly) {
        params.in_stock = 1;
      }

      const response = await apiClient.get<ApiPaginatedResponse<Product>>(
        '/products',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id: number): Promise<ApiResponse<ProductDetail>> => {
    try {
      const response = await apiClient.get<ApiResponse<ProductDetail>>(
        `/products/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (
    productId: number,
    page: number = 1
  ): Promise<ApiPaginatedResponse<Review>> => {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<Review>>(
        `/products/${productId}/reviews`,
        { params: { page } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Create product (seller only)
  createProduct: async (
    data: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.post<ApiResponse<Product>>(
        '/products',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (seller only)
  updateProduct: async (
    id: number,
    data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<Product>> => {
    try {
      const response = await apiClient.put<ApiResponse<Product>>(
        `/products/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete product (seller only)
  deleteProduct: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/products/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Upload product images (seller only)
  uploadProductImages: async (
    productId: number,
    files: File[]
  ): Promise<ApiResponse<{ images: any[] }>> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images[]', file);
      });

      const response = await apiClient.post<ApiResponse<{ images: any[] }>>(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading images for product ${productId}:`, error);
      throw error;
    }
  },

  // Delete product image (seller only)
  deleteProductImage: async (imageId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/products/images/${imageId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting product image ${imageId}:`, error);
      throw error;
    }
  },
};

// Category API Service
export const categoryAPI = {
  // Get all categories
  getCategories: async (): Promise<ApiPaginatedResponse<Category>> => {
    try {
      const response = await apiClient.get<ApiPaginatedResponse<Category>>(
        '/categories'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategory: async (
    id: number
  ): Promise<ApiResponse<Category>> => {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  // Create category (admin only)
  createCategory: async (
    data: Omit<Category, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<Category>> => {
    try {
      const response = await apiClient.post<ApiResponse<Category>>(
        '/categories',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category (admin only)
  updateCategory: async (
    id: number,
    data: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<Category>> => {
    try {
      const response = await apiClient.put<ApiResponse<Category>>(
        `/categories/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },
};

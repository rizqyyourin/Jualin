import apiClient from '../api';

export interface OrderItem {
  id: string | number;
  product_id: string | number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string | number;
  order_number: string;
  user_id?: string | number;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  shipping_address: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  shipping_method?: 'standard' | 'express' | 'overnight';
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderData {
  items: Array<{
    product_id: string | number;
    quantity: number;
  }>;
  shipping_address: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  shipping_method: string;
  payment_method: string;
}

// Order API Service
export const orderAPI = {
  // Get all orders for current user
  getOrders: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    sort?: string;
  }) => {
    try {
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get single order
  getOrder: async (id: string | number) => {
    try {
      const response = await apiClient.get<Order>(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Create new order
  createOrder: async (data: CreateOrderData) => {
    try {
      const response = await apiClient.post<Order>('/orders', data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (id: string | number) => {
    try {
      const response = await apiClient.post<Order>(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  // Get order tracking
  getOrderTracking: async (id: string | number) => {
    try {
      const response = await apiClient.get(`/orders/${id}/tracking`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order tracking ${id}:`, error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id: string | number, status: string) => {
    try {
      const response = await apiClient.put<Order>(`/orders/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },
};

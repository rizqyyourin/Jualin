import apiClient from '../api';

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'customer' | 'merchant' | 'admin';
  is_verified?: boolean;
  store_name?: string;
  store_description?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface PasswordResetData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// Authentication API Service
export const authAPI = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      // Store auth token
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Register new user
  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);

      // Store auth token
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');

      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      // Even if logout fails on server, clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<{ data: User }>('/user/profile', data);

      // Update stored user data
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (password: string): Promise<void> => {
    try {
      await apiClient.delete('/user/account', {
        data: { password }
      });

      // Clear stored data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (data: PasswordResetData) => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token: string) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },
};

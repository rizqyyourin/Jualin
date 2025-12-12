import { useState, useCallback, useEffect } from 'react';
import { authAPI, User, LoginCredentials, RegisterData } from '@/lib/api/auth';
import { AxiosError } from 'axios';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: AxiosError | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(data);
      setUser(response.user);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
}

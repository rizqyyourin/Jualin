import { useState, useCallback, useEffect } from 'react';
import { categoryAPI, Category } from '@/lib/api/products';
import { AxiosError } from 'axios';

interface UseCategories {
  categories: Category[];
  loading: boolean;
  error: AxiosError | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategories {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data?.data || []);
    } catch (err) {
      setError(err as AxiosError);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

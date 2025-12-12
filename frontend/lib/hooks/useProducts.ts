import { useState, useCallback, useEffect } from 'react';
import { productAPI, Product, ProductDetail, ApiPaginatedResponse } from '@/lib/api/products';
import { AxiosError } from 'axios';

interface UseProductsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  inStockOnly?: boolean;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: AxiosError | null;
  pagination: PaginationInfo | null;
  refetch: () => Promise<void>;
}

export function useProducts(options?: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productAPI.getProducts(
        options?.page || 1,
        options?.perPage || 15,
        options?.categoryId,
        options?.search,
        options?.minPrice,
        options?.maxPrice,
        options?.sort,
        options?.inStockOnly
      );
      setProducts(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page,
      });
    } catch (err) {
      setError(err as AxiosError);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [options?.page, options?.perPage, options?.categoryId, options?.search, options?.minPrice, options?.maxPrice, options?.sort, options?.inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, pagination, refetch: fetchProducts };
}

interface UseSingleProductReturn {
  product: ProductDetail | null;
  loading: boolean;
  error: AxiosError | null;
  refetch: () => Promise<void>;
}

export function useProduct(id: number | string): UseSingleProductReturn {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productAPI.getProduct(Number(id));
      setProduct(response.data);
    } catch (err) {
      setError(err as AxiosError);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

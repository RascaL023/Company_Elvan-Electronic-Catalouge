import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../core/types/product';
import { SortOption } from '../core/types/common';
import { useRepository } from './useRepository';
import { filterProducts, sortProducts } from '../services/product.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(
  searchQuery: string,
  sortOption: SortOption
): UseProductsReturn {
  const { productRepository } = useRepository();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productRepository.getAll();
      setAllProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load products'
      );
    } finally {
      setLoading(false);
    }
  }, [productRepository]);

  useEffect(() => {
    load();
  }, [load]);

  const products = useMemo(() => {
    let result = filterProducts(allProducts, searchQuery);
    result = sortProducts(result, sortOption);
    return result;
  }, [allProducts, searchQuery, sortOption]);

  return { products, loading, error, refetch: load };
}

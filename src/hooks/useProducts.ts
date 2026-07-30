import { useState, useEffect, useCallback } from 'react';
import { Product } from '../core/types/product';
import { SortOption } from '../core/types/common';
import { useRepository } from './useRepository';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useProducts(
  searchQuery: string,
  sortOption: SortOption,
  categorySlug: string | null = null
): UseProductsReturn {
  const { productRepository } = useRepository();
  const [products, setProducts] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productRepository.list({
        category: categorySlug ?? undefined,
        sort: sortOption,
        search: searchQuery || undefined,
        limit: 24,
      });
      setProducts(result.products);
      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load products'
      );
    } finally {
      setLoading(false);
    }
  }, [productRepository, categorySlug, sortOption, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await productRepository.list({
        category: categorySlug ?? undefined,
        sort: sortOption,
        search: searchQuery || undefined,
        limit: 24,
        cursor,
      });
      setProducts((prev) => [...prev, ...result.products]);
      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more products'
      );
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, productRepository, categorySlug, sortOption, searchQuery]);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch: load,
  };
}
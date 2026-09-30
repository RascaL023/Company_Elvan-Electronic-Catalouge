import { useState, useEffect, useCallback } from 'react';
import { CatalogProduct } from '../core/types/catalog';
import { SortOption } from '../core/types/common';
import { useRepository } from './useRepository';

interface UseProductsOptions {
  limit?: number;
  includeInactive?: boolean;
}

interface UseProductsReturn {
  products: CatalogProduct[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  removeFromList: (id: string) => void;
}

export function useProducts(
  searchQuery: string,
  sortOption: SortOption,
  categorySlug: string | null = null,
  options: UseProductsOptions = {}
): UseProductsReturn {
  const { productRepository } = useRepository();
  const pageSize = options.limit ?? 24;
  const includeInactive = options.includeInactive ?? false;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
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
        limit: pageSize,
        includeInactive,
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
  }, [productRepository, categorySlug, sortOption, searchQuery, pageSize, includeInactive]);

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
        limit: pageSize,
        cursor,
        includeInactive,
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
  }, [cursor, loadingMore, productRepository, categorySlug, sortOption, searchQuery, pageSize, includeInactive]);

  const removeFromList = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch: load,
    removeFromList,
  };
}
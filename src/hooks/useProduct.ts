import { useState, useEffect } from 'react';
import { Product } from '../core/types/product';
import { useRepository } from './useRepository';

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductReturn {
  const { productRepository } = useRepository();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productRepository
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          if (data) {
            setProduct(data);
          } else {
            setError('Product not found');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load product'
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, productRepository]);

  return { product, loading, error };
}

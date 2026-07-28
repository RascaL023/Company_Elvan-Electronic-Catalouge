import { useState, useEffect } from 'react';
import { Category } from '../core/types/category';
import { useRepository } from './useRepository';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
}

export function useCategories(): UseCategoriesReturn {
  const { categoryRepository } = useRepository();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryRepository
      .getAll()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryRepository]);

  return { categories, loading };
}

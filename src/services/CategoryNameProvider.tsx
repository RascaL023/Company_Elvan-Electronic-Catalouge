import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useCategories } from '../hooks/useCategories';
import {
  createCategoryNameResolver,
  type CategoryNameResolver,
} from '../utils/categories';

/**
 * Category label resolution, driven by data instead of a hardcoded map.
 *
 * `useCategories()` reads the categories through the active repository
 * (`src/services/cached-category.repository.ts` → Firebase or the VPS API) and
 * caches them, so mounting this provider once at the app root costs a single
 * fetch for every screen.
 *
 * Rule of thumb: `product.category` is a **slug** (identity/URL); render its
 * display name through {@link useCategoryName}, never the slug itself.
 */
const CategoryNameContext = createContext<CategoryNameResolver | null>(null);

export function CategoryNameProvider({ children }: { children: ReactNode }) {
  const { categories } = useCategories();
  const resolve = useMemo(
    () => createCategoryNameResolver(categories),
    [categories]
  );

  return (
    <CategoryNameContext.Provider value={resolve}>
      {children}
    </CategoryNameContext.Provider>
  );
}

/** Resolve a category slug to its display name. */
export function useCategoryName(): CategoryNameResolver {
  const ctx = useContext(CategoryNameContext);
  if (!ctx) {
    throw new Error('useCategoryName must be used within a CategoryNameProvider');
  }
  return ctx;
}

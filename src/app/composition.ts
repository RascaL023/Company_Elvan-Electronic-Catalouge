import { BrandRepository } from '../core/repositories/brand.repository';
import { CategoryRepository } from '../core/repositories/category.repository';
import { ProductRepository } from '../core/repositories/product.repository';
import { MockProductRepository } from '../data/mock/mock-product.repository';
import { MockCategoryRepository } from '../data/mock/mock-category.repository';
import { MockBrandRepository } from '../data/mock/mock-brand.repository';
import { FirebaseProductRepository } from '../data/firebase/firebase-product.repository';
import { FirebaseCategoryRepository } from '../data/firebase/firebase-category.repository';
import { FirebaseBrandRepository } from '../data/firebase/firebase-brand.repository';
import { CachedProductRepository } from '../services/cached-product.repository';
import { CachedCategoryRepository } from '../services/cached-category.repository';
import { CachedBrandRepository } from '../services/cached-brand.repository';

/**
 * Composition root: the single place that decides which infrastructure
 * backs the domain repository contracts.
 *
 * ```text
 * Features / Hooks / Components
 *             |
 *             v
 *      Domain interfaces (src/core/repositories/)
 *             |
 *             v
 *   Composition root (this file)
 *         /           \
 *  Firebase adapter   API adapter (future, see src/data/api/README.md)
 * ```
 *
 * Feature code must never read infrastructure env vars directly (e.g.
 * `VITE_FIREBASE_PROJECT_ID`). All selection lives here; Firebase
 * remains the active implementation (see issue #1).
 */
export type DataBackend = 'firebase' | 'mock' | 'api';

export interface RepositorySet {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  brandRepository: BrandRepository;
}

function resolveDataBackend(): DataBackend {
  if (import.meta.env.VITE_API_BASE_URL) {
    return 'api';
  }
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return 'firebase';
  }
  // Local dev without Firebase config keeps working with mocks, but a
  // production build without any backend configured must fail fast
  // instead of silently serving mock data.
  if (import.meta.env.DEV) {
    console.warn(
      '[composition] VITE_FIREBASE_PROJECT_ID is not set; using mock repositories (dev only).'
    );
    return 'mock';
  }
  throw new Error(
    '[composition] No data backend configured. Set VITE_FIREBASE_PROJECT_ID ' +
      'to use Firebase.'
  );
}

/**
 * Build the repository set for the given backend. Called once at startup;
 * pass an explicit backend in tests to avoid env coupling.
 */
export function createRepositories(
  backend: DataBackend = resolveDataBackend()
): RepositorySet {
  if (backend === 'api') {
    throw new Error(
      '[composition] VITE_API_BASE_URL is set, but the API backend is ' +
        'not implemented yet (see issue #1). Unset it to keep using Firebase.'
    );
  }
  if (backend === 'firebase') {
    return {
      productRepository: new CachedProductRepository(
        new FirebaseProductRepository()
      ),
      categoryRepository: new CachedCategoryRepository(
        new FirebaseCategoryRepository()
      ),
      brandRepository: new CachedBrandRepository(
        new FirebaseBrandRepository()
      ),
    };
  }
  if (backend === 'mock') {
    return {
      productRepository: new CachedProductRepository(
        new MockProductRepository()
      ),
      categoryRepository: new CachedCategoryRepository(
        new MockCategoryRepository()
      ),
      brandRepository: new CachedBrandRepository(new MockBrandRepository()),
    };
  }
  const _exhaustive: never = backend;
  throw new Error(`[composition] Unknown data backend: ${_exhaustive}`);
}

/** Singleton wired once at startup; consumed by `src/app/providers.tsx`. */
export const repositories: RepositorySet = createRepositories();

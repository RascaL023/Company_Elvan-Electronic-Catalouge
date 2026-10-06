import { BrandRepository } from '../core/repositories/brand.repository';
import { CategoryRepository } from '../core/repositories/category.repository';
import { ProductRepository } from '../core/repositories/product.repository';
import type { AuthService } from '../core/auth/auth-service';
import type { ImageUploadService } from '../core/services/image-upload.service';
import { MockProductRepository } from '../data/mock/mock-product.repository';
import { MockCategoryRepository } from '../data/mock/mock-category.repository';
import { MockBrandRepository } from '../data/mock/mock-brand.repository';
import { FirebaseProductRepository } from '../data/firebase/firebase-product.repository';
import { FirebaseCategoryRepository } from '../data/firebase/firebase-category.repository';
import { FirebaseBrandRepository } from '../data/firebase/firebase-brand.repository';
import { CachedProductRepository } from '../services/cached-product.repository';
import { CachedCategoryRepository } from '../services/cached-category.repository';
import { CachedBrandRepository } from '../services/cached-brand.repository';
import { FirebaseAuthService } from '../data/firebase/firebase-auth.adapter';
import { ImageKitUploadService } from '../services/imagekit';
import { ApiProductRepository } from '../data/api/api-product.repository';
import { ApiCategoryRepository } from '../data/api/api-category.repository';
import { ApiBrandRepository } from '../data/api/api-brand.repository';
import { ApiAuthService } from '../data/api/api-auth.service';
import { ApiImageUploadService } from '../data/api/api-image-upload.service';
import { apiConfig, isApiEnabled } from '../config/api';

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
 *  Firebase adapter   API adapter (src/data/api/)
 * ```
 *
 * Feature code must never read infrastructure env vars directly (e.g.
 * `VITE_FIREBASE_PROJECT_ID`). All selection lives here; `src/config/api.ts`
 * holds the per-concern backend switches so data/auth/media can move to the
 * VPS API independently (see src/data/api/README.md).
 */
export type DataBackend = 'firebase' | 'mock' | 'api';

export interface RepositorySet {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  brandRepository: BrandRepository;
}

function resolveDataBackend(): DataBackend {
  if (isApiEnabled) {
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
    '[composition] No data backend configured. Set VITE_API_BASE_URL to use ' +
      'the API, or VITE_FIREBASE_PROJECT_ID to use Firebase.'
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
    return {
      productRepository: new CachedProductRepository(new ApiProductRepository()),
      categoryRepository: new CachedCategoryRepository(
        new ApiCategoryRepository()
      ),
      brandRepository: new CachedBrandRepository(new ApiBrandRepository()),
    };
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

/**
 * Active authentication backend. Selected by `VITE_AUTH_BACKEND`
 * (`firebase` | `api`); both adapters exist, so the UI (`useAuth`, admin
 * pages) stays untouched either way.
 */
export const authService: AuthService =
  apiConfig.authBackend === 'api' ? new ApiAuthService() : new FirebaseAuthService();

/**
 * Active image upload backend. Feature code must use this (or a hook
 * returning it) instead of importing `src/services/imagekit.ts` directly.
 * Selected by `VITE_MEDIA_BACKEND` (`firebase` | `api`): the API adapter
 * fetches its signature from the backend; the Firebase adapter keeps using
 * the legacy endpoint (`VITE_IMAGEKIT_AUTH_ENDPOINT`).
 */
export const imageUploadService: ImageUploadService =
  apiConfig.mediaBackend === 'api'
    ? new ApiImageUploadService()
    : new ImageKitUploadService();

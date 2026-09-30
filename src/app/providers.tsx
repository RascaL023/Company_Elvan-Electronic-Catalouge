import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { MockProductRepository } from '../data/mock/mock-product.repository';
import { MockCategoryRepository } from '../data/mock/mock-category.repository';
import { MockBrandRepository } from '../data/mock/mock-brand.repository';
import { FirebaseProductRepository } from '../data/firebase/firebase-product.repository';
import { FirebaseCategoryRepository } from '../data/firebase/firebase-category.repository';
import { FirebaseBrandRepository } from '../data/firebase/firebase-brand.repository';
import { CachedProductRepository } from '../services/cached-product.repository';
import { CachedCategoryRepository } from '../services/cached-category.repository';
import { CachedBrandRepository } from '../services/cached-brand.repository';

const useFirebase = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

const productRepository = new CachedProductRepository(
  useFirebase
    ? new FirebaseProductRepository()
    : new MockProductRepository()
);

const categoryRepository = new CachedCategoryRepository(
  useFirebase
    ? new FirebaseCategoryRepository()
    : new MockCategoryRepository()
);

const brandRepository = new CachedBrandRepository(
  useFirebase
    ? new FirebaseBrandRepository()
    : new MockBrandRepository()
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider
      productRepository={productRepository}
      categoryRepository={categoryRepository}
      brandRepository={brandRepository}
    >
      {children}
    </DataProvider>
  );
}

import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { MockProductRepository } from '../data/mock/mock-product.repository';
import { MockCategoryRepository } from '../data/mock/mock-category.repository';

const productRepository = new MockProductRepository();
const categoryRepository = new MockCategoryRepository();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider
      productRepository={productRepository}
      categoryRepository={categoryRepository}
    >
      {children}
    </DataProvider>
  );
}

import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { repositories } from './composition';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider
      productRepository={repositories.productRepository}
      categoryRepository={repositories.categoryRepository}
      brandRepository={repositories.brandRepository}
    >
      {children}
    </DataProvider>
  );
}

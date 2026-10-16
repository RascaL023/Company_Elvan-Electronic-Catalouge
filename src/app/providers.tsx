import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { CategoryNameProvider } from '../services/CategoryNameProvider';
import { repositories } from './composition';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider
      productRepository={repositories.productRepository}
      categoryRepository={repositories.categoryRepository}
      brandRepository={repositories.brandRepository}
    >
      {/* Needs DataProvider above it: category names come from the active
          category repository, so display labels follow the data. */}
      <CategoryNameProvider>{children}</CategoryNameProvider>
    </DataProvider>
  );
}

import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { MockProductRepository } from '../data/mock/mock-product.repository';

const productRepository = new MockProductRepository();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider productRepository={productRepository}>
      {children}
    </DataProvider>
  );
}

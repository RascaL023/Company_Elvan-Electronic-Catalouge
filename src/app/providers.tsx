import { ReactNode } from 'react';
import { DataProvider } from '../services/DataProvider';
import { UiProvider } from '../services/UiProvider';
import { FakeStoreProductRepository } from '../data/fakestore/fakestore-product.repository';
import { LocalCartRepository } from '../data/local/local-cart.repository';

const repositories = {
  product: new FakeStoreProductRepository(),
  cart: new LocalCartRepository(),
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DataProvider repositories={repositories}>
      <UiProvider>{children}</UiProvider>
    </DataProvider>
  );
}

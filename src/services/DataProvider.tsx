import { createContext, useContext, ReactNode } from 'react';
import { ProductRepository } from '../core/repositories/product.repository';
import { CartRepository } from '../core/repositories/cart.repository';

interface DataContextValue {
  productRepository: ProductRepository;
  cartRepository: CartRepository;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  repositories: {
    product: ProductRepository;
    cart: CartRepository;
  };
  children: ReactNode;
}

export function DataProvider({ repositories, children }: DataProviderProps) {
  return (
    <DataContext.Provider
      value={{
        productRepository: repositories.product,
        cartRepository: repositories.cart,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return ctx;
}

import { createContext, useContext, ReactNode } from 'react';
import { ProductRepository } from '../core/repositories/product.repository';

interface DataContextValue {
  productRepository: ProductRepository;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  productRepository: ProductRepository;
  children: ReactNode;
}

export function DataProvider({
  productRepository,
  children,
}: DataProviderProps) {
  return (
    <DataContext.Provider value={{ productRepository }}>
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

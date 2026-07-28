import { createContext, useContext, ReactNode } from 'react';
import { ProductRepository } from '../core/repositories/product.repository';
import { CategoryRepository } from '../core/repositories/category.repository';

interface DataContextValue {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  children: ReactNode;
}

export function DataProvider({
  productRepository,
  categoryRepository,
  children,
}: DataProviderProps) {
  return (
    <DataContext.Provider
      value={{ productRepository, categoryRepository }}
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

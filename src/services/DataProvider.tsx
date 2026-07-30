import { createContext, useContext, ReactNode } from 'react';
import { ProductRepository } from '../core/repositories/product.repository';
import { CategoryRepository } from '../core/repositories/category.repository';
import { BrandRepository } from '../core/repositories/brand.repository';

interface DataContextValue {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  brandRepository: BrandRepository;
}

const DataContext = createContext<DataContextValue | null>(null);

interface DataProviderProps {
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  brandRepository: BrandRepository;
  children: ReactNode;
}

export function DataProvider({
  productRepository,
  categoryRepository,
  brandRepository,
  children,
}: DataProviderProps) {
  return (
    <DataContext.Provider
      value={{ productRepository, categoryRepository, brandRepository }}
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

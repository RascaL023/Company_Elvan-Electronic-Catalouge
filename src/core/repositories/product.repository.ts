import { Product } from '../types/product';
import { SortOption } from '../types/common';

export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

export interface ProductListOptions {
  category?: string;
  sort?: SortOption;
  search?: string;
  limit?: number;
  cursor?: string;
  includeInactive?: boolean;
}

export interface ProductListResult {
  products: Product[];
  hasMore: boolean;
  cursor: string | null;
}

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  list(options?: ProductListOptions): Promise<ProductListResult>;
  getById(id: string): Promise<Product | null>;
  create(payload: ProductPayload): Promise<Product>;
  update(id: string, payload: Partial<ProductPayload>): Promise<Product>;
  delete(id: string): Promise<void>;
}

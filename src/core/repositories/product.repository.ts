import { Product } from '../types/product';

// Product payload without server-managed fields
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(payload: ProductPayload): Promise<Product>;
  update(id: string, payload: Partial<ProductPayload>): Promise<Product>;
  delete(id: string): Promise<void>;
}

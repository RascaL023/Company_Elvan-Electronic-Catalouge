import { Product } from '../types/product';
import { SortOption } from '../types/common';

/**
 * Payload for creating a product.
 *
 * `id` is optional and infrastructure-agnostic:
 * - When provided, the implementation must use it as the record id
 *   (Firestore document id today, primary key / unique id for a future
 *   SQL-backed API).
 * - When omitted, the implementation generates one.
 *
 * The id is never stored as a separate data field; it is the record
 * identity. Payloads carry domain concepts only (no Firestore types).
 */
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

/**
 * Application-level list options.
 *
 * Implementations may satisfy these client-side (current Firestore
 * implementation) or server-side (future HTTP/API implementation).
 * `cursor` is opaque to callers: the id of the last item received.
 */
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

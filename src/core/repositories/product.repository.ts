import { Product } from '../types/product';
import { SortOption } from '../types/common';

/**
 * Payload for creating a product.
 *
 * `id` is an optional client-provided hint, kept for Firestore
 * compatibility (document id). Implementations MAY honor it, but are
 * not required to:
 * - Firestore / mock implementations use it when provided, otherwise
 *   generate one.
 * - A future SQL-backed API (serial / uuid primary key) MAY ignore the
 *   hint and always return a server-generated id.
 *
 * Callers must therefore never assume the created record keeps the
 * requested id; always use the id from the returned `Product`.
 * The id is never stored as a separate data field; it is the record
 * identity. Payloads carry domain concepts only (no Firestore types).
 */
export type ProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string };

/**
 * Application-level list options.
 *
 * Implementations may satisfy these client-side (current Firestore
 * implementation) or server-side (future HTTP/API implementation).
 *
 * `cursor` is an opaque pagination token. Callers must treat it as an
 * implementation-defined value: pass back the `cursor` from the previous
 * `ProductListResult` without parsing or constructing it. The current
 * Firebase implementation happens to derive it from the in-memory
 * dataset, while a future API implementation may use a real database
 * cursor — that detail belongs to the adapter, not this contract.
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
  /**
   * Opaque token for the next page (null when there is no next page).
   * Pass it back as `ProductListOptions.cursor`; do not parse it.
   */
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

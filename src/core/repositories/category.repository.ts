import { Category, CategoryPayload } from '../types/category';

/**
 * Domain contract for category data access.
 *
 * Payloads and entities use domain concepts only (no Firestore types).
 * `create` always generates the record id; a future SQL-backed
 * implementation may use an auto-increment key or uuid without
 * changing this contract.
 */
export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(payload: CategoryPayload): Promise<Category>;
  update(id: string, payload: Partial<CategoryPayload>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export type { CategoryPayload };

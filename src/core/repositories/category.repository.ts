import { Category, CategoryPayload } from '../types/category';

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(payload: CategoryPayload): Promise<Category>;
  update(id: string, payload: Partial<CategoryPayload>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export type { CategoryPayload };

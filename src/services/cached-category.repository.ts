import { CategoryRepository } from '../core/repositories/category.repository';
import { Category, CategoryPayload } from '../core/types/category';
import { SimpleCache } from './cache';

const TTL = 300_000;

export class CachedCategoryRepository implements CategoryRepository {
  private cache = new SimpleCache();

  constructor(private inner: CategoryRepository) {}

  async getAll(): Promise<Category[]> {
    const key = 'getAll';
    const cached = this.cache.get<Category[]>(key);
    if (cached) return cached;
    const result = await this.inner.getAll();
    this.cache.set(key, result, TTL);
    return result;
  }

  async getById(id: string): Promise<Category | null> {
    const key = `getById:${id}`;
    const cached = this.cache.get<Category | null>(key);
    if (cached !== null) return cached;
    const result = await this.inner.getById(id);
    if (result) this.cache.set(key, result, TTL);
    return result;
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const result = await this.inner.create(payload);
    this.cache.clear();
    return result;
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const result = await this.inner.update(id, payload);
    this.cache.clear();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    this.cache.clear();
  }
}

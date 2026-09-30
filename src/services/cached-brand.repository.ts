import { BrandRepository } from '../core/repositories/brand.repository';
import { Brand, BrandPayload } from '../core/types/brand';
import { SimpleCache } from './cache';

const TTL = 300_000;

export class CachedBrandRepository implements BrandRepository {
  private cache = new SimpleCache();

  constructor(private inner: BrandRepository) {}

  async getAll(): Promise<Brand[]> {
    const key = 'getAll';
    const cached = this.cache.get<Brand[]>(key);
    if (cached) return cached;
    const result = await this.inner.getAll();
    this.cache.set(key, result, TTL);
    return result;
  }

  async getById(id: string): Promise<Brand | null> {
    const key = `getById:${id}`;
    const cached = this.cache.get<Brand | null>(key);
    if (cached !== null) return cached;
    const result = await this.inner.getById(id);
    if (result) this.cache.set(key, result, TTL);
    return result;
  }

  async create(payload: BrandPayload): Promise<Brand> {
    const result = await this.inner.create(payload);
    this.cache.clear();
    return result;
  }

  async update(id: string, payload: Partial<BrandPayload>): Promise<Brand> {
    const result = await this.inner.update(id, payload);
    this.cache.clear();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    this.cache.clear();
  }
}

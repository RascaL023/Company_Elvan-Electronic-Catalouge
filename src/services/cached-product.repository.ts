import {
  ProductRepository,
  ProductPayload,
  ProductListOptions,
  ProductListResult,
} from '../core/repositories/product.repository';
import { Product } from '../core/types/product';
import { CatalogProduct } from '../core/types/catalog';
import { SimpleCache } from './cache';

const TTL = 180_000;

export class CachedProductRepository implements ProductRepository {
  private cache = new SimpleCache();

  constructor(private inner: ProductRepository) {}

  async list(options?: ProductListOptions): Promise<ProductListResult> {
    if (options?.cursor) {
      return this.inner.list(options);
    }
    const key = `list:${JSON.stringify(options)}`;
    const cached = this.cache.get<ProductListResult>(key);
    if (cached) return cached;
    const result = await this.inner.list(options);
    this.cache.set(key, result, TTL);
    return result;
  }

  async getAll(): Promise<CatalogProduct[]> {
    const key = 'getAll';
    const cached = this.cache.get<CatalogProduct[]>(key);
    if (cached) return cached;
    const result = await this.inner.getAll();
    this.cache.set(key, result, TTL);
    return result;
  }

  async getById(id: string): Promise<Product | null> {
    const key = `getById:${id}`;
    const cached = this.cache.get<Product | null>(key);
    if (cached !== null) return cached;
    const result = await this.inner.getById(id);
    if (result) this.cache.set(key, result, TTL);
    return result;
  }

  async create(payload: ProductPayload): Promise<Product> {
    const result = await this.inner.create(payload);
    this.cache.clear();
    return result;
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const result = await this.inner.update(id, payload);
    this.cache.clear();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    this.cache.clear();
  }
}
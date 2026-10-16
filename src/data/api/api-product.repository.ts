/**
 * `ProductRepository` backed by the VPS API (`src/data/api/README.md`).
 *
 * Depends only on the domain contract and the HTTP client — no Firebase
 * import, so `scripts/check-boundaries.sh` stays green on the API path.
 */

import type {
  ProductRepository,
  ProductPayload,
  ProductListOptions,
  ProductListResult,
} from '../../core/repositories/product.repository';
import type { Product } from '../../core/types/product';
import type { CatalogProduct } from '../../core/types/catalog';
import { apiRequest, ApiError } from './http-client';
import {
  toCatalogProduct,
  toListResult,
  toProduct,
  toProductWriteBody,
  type CatalogProductDto,
  type ProductDto,
  type ProductListDto,
} from './mappers';

export class ApiProductRepository implements ProductRepository {
  async getAll(): Promise<CatalogProduct[]> {
    const dtos = await apiRequest<CatalogProductDto[]>('/catalog');
    return dtos.map(toCatalogProduct);
  }

  async list(options: ProductListOptions = {}): Promise<ProductListResult> {
    const dto = await apiRequest<ProductListDto>('/products', {
      query: {
        category: options.category,
        sort: options.sort,
        search: options.search,
        limit: options.limit,
        cursor: options.cursor,
        includeInactive: options.includeInactive,
      },
    });
    return toListResult(dto);
  }

  async getById(id: string): Promise<Product | null> {
    // The backend resolves a UUID or a legacy Firestore id, so old
    // /product/:id URLs keep working.
    try {
      const dto = await apiRequest<ProductDto>(`/products/${encodeURIComponent(id)}`);
      return toProduct(dto);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  }

  async create(payload: ProductPayload): Promise<Product> {
    const dto = await apiRequest<ProductDto>('/products', {
      method: 'POST',
      body: toProductWriteBody(payload),
    });
    return toProduct(dto);
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const dto = await apiRequest<ProductDto>(
      `/products/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: toProductWriteBody(payload) }
    );
    return toProduct(dto);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

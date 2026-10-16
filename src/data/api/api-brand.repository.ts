/**
 * `BrandRepository` backed by the VPS API.
 * See `src/data/api/api-product.repository.ts` for the shared conventions.
 */

import type {
  BrandRepository,
  BrandPayload,
} from '../../core/repositories/brand.repository';
import type { Brand } from '../../core/types/brand';
import { apiRequest, ApiError } from './http-client';
import { toBrand, type BrandDto } from './mappers';

function toWriteBody(payload: Partial<BrandPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  return body;
}

export class ApiBrandRepository implements BrandRepository {
  async getAll(): Promise<Brand[]> {
    const dtos = await apiRequest<BrandDto[]>('/brands');
    return dtos.map(toBrand);
  }

  async getById(id: string): Promise<Brand | null> {
    try {
      const dto = await apiRequest<BrandDto>(`/brands/${encodeURIComponent(id)}`);
      return toBrand(dto);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  }

  async create(payload: BrandPayload): Promise<Brand> {
    const dto = await apiRequest<BrandDto>('/brands', {
      method: 'POST',
      body: toWriteBody(payload),
    });
    return toBrand(dto);
  }

  async update(id: string, payload: Partial<BrandPayload>): Promise<Brand> {
    const dto = await apiRequest<BrandDto>(
      `/brands/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: toWriteBody(payload) }
    );
    return toBrand(dto);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/brands/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

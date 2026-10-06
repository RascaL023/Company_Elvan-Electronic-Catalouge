/**
 * `CategoryRepository` backed by the VPS API.
 * See `src/data/api/api-product.repository.ts` for the shared conventions.
 */

import type {
  CategoryRepository,
  CategoryPayload,
} from '../../core/repositories/category.repository';
import type { Category } from '../../core/types/category';
import { apiRequest, ApiError } from './http-client';
import { toCategory, type CategoryDto } from './mappers';

function toWriteBody(
  payload: Partial<CategoryPayload>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.description !== undefined) body.description = payload.description;
  return body;
}

export class ApiCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    const dtos = await apiRequest<CategoryDto[]>('/categories');
    return dtos.map(toCategory);
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const dto = await apiRequest<CategoryDto>(
        `/categories/${encodeURIComponent(id)}`
      );
      return toCategory(dto);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const dto = await apiRequest<CategoryDto>('/categories', {
      method: 'POST',
      body: toWriteBody(payload),
    });
    return toCategory(dto);
  }

  async update(
    id: string,
    payload: Partial<CategoryPayload>
  ): Promise<Category> {
    const dto = await apiRequest<CategoryDto>(
      `/categories/${encodeURIComponent(id)}`,
      { method: 'PATCH', body: toWriteBody(payload) }
    );
    return toCategory(dto);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

/**
 * Mapping between the VPS API wire shapes and the domain types in
 * `src/core/`. This is the ONLY place that knows about the API's JSON field
 * names, so a backend change stops here instead of leaking into the UI.
 *
 * The two live mismatches handled here (see docs/ARCHITECTURE.md):
 * - images: API `[{ key, fileId }]` ↔ domain `images: string[]` +
 *   `imageFileIds?: string[]` (parallel arrays).
 * - write payloads: the API rejects unknown fields, so `id` / `imageFileIds`
 *   must never be sent, and `brand` must be `''` (not omitted) when cleared.
 */

import type { Product } from '../../core/types/product';
import type { CatalogProduct } from '../../core/types/catalog';
import type { Category } from '../../core/types/category';
import type { Brand } from '../../core/types/brand';
import type {
  ProductPayload,
  ProductListResult,
} from '../../core/repositories/product.repository';

export interface ImageDto {
  key: string;
  fileId: string;
}

export interface RatingDto {
  rate: number;
  count: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  images: ImageDto[];
  rating: RatingDto;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogProductDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  brand: string;
  thumbnail: string;
  rating: RatingDto;
  isActive: boolean;
  createdAt: string;
}

export interface ProductListDto {
  products: CatalogProductDto[];
  hasMore: boolean;
  cursor: string | null;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDto {
  id: string;
  email: string;
  createdAt: string;
}

export interface SessionDto {
  admin: AdminDto;
  expiresAt: string;
}

export interface SignatureDto {
  token: string;
  expire: number;
  signature: string;
}

function optionalString(value: string | undefined | null): string | undefined {
  return value ? value : undefined;
}

function toRating(dto: RatingDto | undefined): { rate: number; count: number } {
  return { rate: dto?.rate ?? 0, count: dto?.count ?? 0 };
}

export function toProduct(dto: ProductDto): Product {
  const images = dto.images ?? [];
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.price,
    description: dto.description,
    category: dto.category,
    brand: optionalString(dto.brand),
    images: images.map((image) => image.key),
    imageFileIds: images.map((image) => image.fileId ?? ''),
    rating: toRating(dto.rating),
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function toCatalogProduct(dto: CatalogProductDto): CatalogProduct {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    price: dto.price,
    category: dto.category,
    brand: dto.brand ?? '',
    thumbnail: dto.thumbnail ?? '',
    rating: toRating(dto.rating),
    isActive: dto.isActive,
    createdAt: dto.createdAt,
  };
}

export function toListResult(dto: ProductListDto): ProductListResult {
  return {
    products: (dto.products ?? []).map(toCatalogProduct),
    hasMore: dto.hasMore,
    cursor: dto.cursor ?? null,
  };
}

export function toCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? '',
    createdAt: optionalString(dto.createdAt),
    updatedAt: optionalString(dto.updatedAt),
  };
}

export function toBrand(dto: BrandDto): Brand {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    createdAt: optionalString(dto.createdAt),
    updatedAt: optionalString(dto.updatedAt),
  };
}

/**
 * Domain payload → API write body for create/update.
 *
 * Only known fields are copied (the API uses `DisallowUnknownFields`), and
 * `brand` is sent as `''` whenever the key is present so clearing a brand is
 * possible.
 */
export function toProductWriteBody(
  payload: Partial<ProductPayload>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = payload.name;
  if (payload.slug !== undefined) body.slug = payload.slug;
  if (payload.price !== undefined) body.price = payload.price;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.category !== undefined) body.category = payload.category;
  if ('brand' in payload) body.brand = payload.brand ?? '';
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  if (payload.rating !== undefined) {
    body.rating = { rate: payload.rating.rate, count: payload.rating.count };
  }
  if (payload.images !== undefined) {
    body.images = payload.images.map((key, index) => ({
      key,
      fileId: payload.imageFileIds?.[index] ?? '',
    }));
  }

  return body;
}

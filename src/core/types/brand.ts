/**
 * Domain brand entity (`createdAt` / `updatedAt` are ISO-8601 strings;
 * see `Product` for the infrastructure-agnostic conventions).
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BrandPayload = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;

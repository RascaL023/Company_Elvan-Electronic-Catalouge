/**
 * Domain category entity (`createdAt` / `updatedAt` are ISO-8601 strings;
 * see `Product` for the infrastructure-agnostic conventions).
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryPayload = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

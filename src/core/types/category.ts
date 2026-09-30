export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryPayload = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

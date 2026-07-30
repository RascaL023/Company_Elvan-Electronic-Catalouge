export interface Brand {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BrandPayload = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>;

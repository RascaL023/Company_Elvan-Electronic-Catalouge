import { Brand, BrandPayload } from '../types/brand';

export interface BrandRepository {
  getAll(): Promise<Brand[]>;
  getById(id: string): Promise<Brand | null>;
  create(payload: BrandPayload): Promise<Brand>;
  update(id: string, payload: Partial<BrandPayload>): Promise<Brand>;
  delete(id: string): Promise<void>;
}

export type { BrandPayload };

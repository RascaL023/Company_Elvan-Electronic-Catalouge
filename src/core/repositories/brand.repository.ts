import { Brand, BrandPayload } from '../types/brand';

/**
 * Domain contract for brand data access.
 *
 * Payloads and entities use domain concepts only (no Firestore types).
 * `create` always generates the record id; a future SQL-backed
 * implementation may use an auto-increment key or uuid without
 * changing this contract.
 */
export interface BrandRepository {
  getAll(): Promise<Brand[]>;
  getById(id: string): Promise<Brand | null>;
  create(payload: BrandPayload): Promise<Brand>;
  update(id: string, payload: Partial<BrandPayload>): Promise<Brand>;
  delete(id: string): Promise<void>;
}

export type { BrandPayload };

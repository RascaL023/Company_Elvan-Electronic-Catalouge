import { BrandRepository } from '../../core/repositories/brand.repository';
import { Brand, BrandPayload } from '../../core/types/brand';

const data: Brand[] = [
  { id: 'samsung', name: 'Samsung', slug: 'samsung', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'lg', name: 'LG', slug: 'lg', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sharp', name: 'Sharp', slug: 'sharp', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'pld', name: 'PLD', slug: 'pld', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'polytron', name: 'Polytron', slug: 'polytron', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'aqua', name: 'Aqua', slug: 'aqua', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'toshiba', name: 'Toshiba', slug: 'toshiba', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'panasonic', name: 'Panasonic', slug: 'panasonic', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sanken', name: 'Sanken', slug: 'sanken', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'denpoo', name: 'Denpoo', slug: 'denpoo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'changhong', name: 'Changhong', slug: 'changhong', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'coocaa', name: 'Coocaa', slug: 'coocaa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'akari', name: 'Akari', slug: 'akari', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'gastroback', name: 'Gastroback', slug: 'gastroback', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class MockBrandRepository implements BrandRepository {
  async getAll(): Promise<Brand[]> {
    return [...data];
  }

  async getById(id: string): Promise<Brand | null> {
    return data.find((b) => b.id === id) || null;
  }

  async create(payload: BrandPayload): Promise<Brand> {
    const now = new Date().toISOString();
    const brand: Brand = {
      ...payload,
      id: payload.slug,
      createdAt: now,
      updatedAt: now,
    };
    data.push(brand);
    return brand;
  }

  async update(id: string, payload: Partial<BrandPayload>): Promise<Brand> {
    const index = data.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Brand "${id}" not found`);
    const updated: Brand = {
      ...data[index],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    data[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = data.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Brand "${id}" not found`);
    data.splice(index, 1);
  }
}

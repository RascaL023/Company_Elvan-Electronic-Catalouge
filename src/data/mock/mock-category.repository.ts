import { CategoryRepository } from '../../core/repositories/category.repository';
import { Category, CategoryPayload } from '../../core/types/category';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const data: Category[] = [
  {
    id: 'refrigerator',
    name: 'Kulkas',
    slug: 'refrigerator',
    description: 'Pendingin, freezer, dan lemari es',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'television',
    name: 'Televisi',
    slug: 'television',
    description: 'TV LED, Smart TV, dan layar display',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    slug: 'smartphone',
    description: 'Handphone, tablet, dan aksesoris',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'washing_machine',
    name: 'Mesin Cuci',
    slug: 'washing_machine',
    description: 'Mesin cuci front load, top load, dan pengering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sewing_machine',
    name: 'Mesin Jahit',
    slug: 'sewing_machine',
    description: 'Mesin jahit portable, industri, dan overlock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MockCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    return [...data];
  }

  async getById(id: string): Promise<Category | null> {
    return data.find((c) => c.id === id) || null;
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const now = new Date().toISOString();
    const category: Category = {
      ...payload,
      id: payload.slug || slugify(payload.name),
      createdAt: now,
      updatedAt: now,
    };
    data.push(category);
    return category;
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const index = data.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Category "${id}" not found`);
    const updated: Category = {
      ...data[index],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    data[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = data.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Category "${id}" not found`);
    data.splice(index, 1);
  }
}

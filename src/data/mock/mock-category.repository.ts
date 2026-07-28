import { CategoryRepository } from '../../core/repositories/category.repository';
import { Category } from '../../core/types/category';

const categories: Category[] = [
  {
    id: 'refrigerator',
    name: 'Kulkas',
    slug: 'refrigerator',
    description: 'Pendingin, freezer, dan lemari es',
  },
  {
    id: 'television',
    name: 'Televisi',
    slug: 'television',
    description: 'TV LED, Smart TV, dan layar display',
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    slug: 'smartphone',
    description: 'Handphone, tablet, dan aksesoris',
  },
  {
    id: 'washing_machine',
    name: 'Mesin Cuci',
    slug: 'washing_machine',
    description: 'Mesin cuci front load, top load, dan pengering',
  },
  {
    id: 'sewing_machine',
    name: 'Mesin Jahit',
    slug: 'sewing_machine',
    description: 'Mesin jahit portable, industri, dan overlock',
  },
];

export class MockCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    return [...categories];
  }

  async getById(id: string): Promise<Category | null> {
    return categories.find((c) => c.id === id) || null;
  }
}

import { ProductRepository } from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';
import { FakeStoreProduct, toDomainProduct } from './fakestore.mapper';

const BASE_URL = 'https://fakestoreapi.com';

export class FakeStoreProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${BASE_URL}/products/category/electronics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const raw = await response.json();
    return (raw as FakeStoreProduct[]).map(toDomainProduct);
  }

  async getById(id: string): Promise<Product | null> {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) return null;
    const raw = await response.json();
    return toDomainProduct(raw);
  }
}

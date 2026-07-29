import { Product } from '../core/types/product';

export function filterByQuery(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const q = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(q));
}

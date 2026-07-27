import { Product } from '../core/types/product';
import { SortOption } from '../core/types/common';

export function filterProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const q = query.toLowerCase();
  return products.filter((p) => p.title.toLowerCase().includes(q));
}

export function sortProducts(
  products: Product[],
  option: SortOption
): Product[] {
  const sorted = [...products];
  switch (option) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      sorted.sort((a, b) => b.rating.rate - a.rating.rate);
      break;
  }
  return sorted;
}

import { Product } from '../../core/types/product';

export interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export function toDomainProduct(raw: FakeStoreProduct): Product {
  return {
    id: String(raw.id),
    title: raw.title,
    price: raw.price,
    description: raw.description,
    category: raw.category,
    image: raw.image,
    rating: {
      rate: raw.rating.rate,
      count: raw.rating.count,
    },
  };
}

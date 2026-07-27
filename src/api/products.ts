import { Product } from '../types/product';

const API_URL = 'https://fakestoreapi.com/products/category/electronics';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch products: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

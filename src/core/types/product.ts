export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  rating: {
    rate: number;
    count: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
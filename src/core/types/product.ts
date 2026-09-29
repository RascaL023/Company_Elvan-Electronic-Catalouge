/**
 * Domain product entity.
 *
 * Deliberately free of infrastructure types so it can be served by
 * Firestore today or a SQL-backed API later:
 * - `id` is an opaque string (Firestore document id today).
 * - `createdAt` / `updatedAt` are ISO-8601 strings, never Firestore
 *   `Timestamp` objects outside `src/data/firebase/`.
 * - `images` are provider-independent relative keys
 *   (e.g. `assets/images/products/television/example.jpg`), resolved
 *   to full URLs by the image service.
 * - `category` / `brand` are plain slug references, not document refs.
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  brand?: string;
  images: string[];
  imageFileIds?: string[];
  rating: {
    rate: number;
    count: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
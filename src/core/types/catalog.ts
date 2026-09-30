import { Product } from './product';

/**
 * Read-optimized projection of a product for the public catalog.
 *
 * The public catalog does NOT need every field of the canonical
 * `Product` document. It only needs what the listing UI actually uses:
 * listing, search, filter, sort, pagination and navigation to the
 * detail page. The full document (`products/{id}`) stays the source of
 * truth and is only read for the detail page / admin edit form.
 *
 * This shape is intentionally lightweight so the whole catalog can live
 * in a single Firestore document (`catalog/snapshot`) and be read with
 * ONE document read instead of one read per product.
 *
 * Excluded on purpose:
 * - `description` (only the detail page shows it; quick view no longer does)
 * - `imageFileIds` (only used by admin delete to clean up ImageKit files)
 * - `updatedAt` / full image arrays (only the primary image key is kept)
 */
export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  brand: string;
  /** Relative image key of the primary image only (see image resolver). */
  thumbnail: string;
  rating: {
    rate: number;
    count: number;
  };
  isActive: boolean;
  /** ISO-8601 string; used for the default "newest first" sort. */
  createdAt: string;
}

/**
 * Read model stored in the single Firestore document `catalog/snapshot`.
 * `products` is a projection of `products/*`; it can always be rebuilt
 * from the source-of-truth collection.
 */
export interface CatalogSnapshot {
  version: number;
  updatedAt: string;
  products: CatalogProduct[];
}

/**
 * Project a canonical {@link Product} into the lightweight
 * {@link CatalogProduct} used by the catalog read model.
 *
 * Defined in `core` (not in the Firebase layer) so every repository
 * implementation — Firestore today, a future API tomorrow — produces
 * the exact same projection.
 */
export function toCatalogProduct(product: Product): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    category: product.category,
    // Coerced to '' so the value is always Firestore-serializable
    // (Firestore rejects `undefined` inside arrays/objects).
    brand: product.brand ?? '',
    thumbnail: product.images[0] ?? '',
    rating: {
      rate: product.rating?.rate ?? 0,
      count: product.rating?.count ?? 0,
    },
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
}

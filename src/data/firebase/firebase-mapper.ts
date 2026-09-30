import { DocumentData, DocumentSnapshot, Timestamp } from 'firebase/firestore/lite';
import { Product } from '../../core/types/product';
import { CatalogProduct, CatalogSnapshot } from '../../core/types/catalog';
import { Category } from '../../core/types/category';

/**
 * Map a raw Firestore product payload into the domain `Product`.
 * Shared by document reads and by transaction merges, so the mapping
 * logic lives in one place.
 */
export function productFromData(id: string, data: DocumentData): Product {
  if (!data) throw new Error(`Product document ${id} has no data`);
  return {
    id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    price: data.price ?? 0,
    description: data.description ?? '',
    category: data.category ?? '',
    brand: data.brand ?? undefined,
    images: data.images ?? [],
    imageFileIds: data.imageFileIds ?? [],
    rating: {
      rate: data.rating?.rate ?? 0,
      count: data.rating?.count ?? 0,
    },
    isActive: data.isActive ?? true,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt ?? new Date().toISOString()),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt ?? new Date().toISOString()),
  };
}

export function docToProduct(doc: DocumentSnapshot): Product {
  return productFromData(doc.id, doc.data() ?? {});
}

/**
 * Rebuild the `CatalogSnapshot` read model from a raw `catalog/snapshot`
 * document payload. Entries are already projected, so this only applies
 * defensive defaults.
 */
export function snapshotFromData(data: DocumentData): CatalogSnapshot {
  const raw: unknown[] = Array.isArray(data?.products) ? data.products : [];
  return {
    version: typeof data?.version === 'number' ? data.version : 0,
    updatedAt: typeof data?.updatedAt === 'string' ? data.updatedAt : '',
    products: raw.map((entry) => catalogProductFromData(entry as DocumentData)),
  };
}

function catalogProductFromData(data: DocumentData): CatalogProduct {
  return {
    id: data?.id ?? '',
    name: data?.name ?? '',
    slug: data?.slug ?? '',
    price: data?.price ?? 0,
    category: data?.category ?? '',
    brand: data?.brand ?? '',
    thumbnail: data?.thumbnail ?? '',
    rating: {
      rate: data?.rating?.rate ?? 0,
      count: data?.rating?.count ?? 0,
    },
    isActive: data?.isActive ?? true,
    createdAt: data?.createdAt ?? '',
  };
}

export function docToCategory(doc: DocumentSnapshot): Category {
  const data = doc.data();
  if (!data) throw new Error(`Category document ${doc.id} has no data`);
  return {
    id: doc.id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    description: data.description ?? '',
  };
}

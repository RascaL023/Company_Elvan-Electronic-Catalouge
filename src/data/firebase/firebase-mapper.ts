import { DocumentSnapshot, Timestamp } from 'firebase/firestore';
import { Product } from '../../core/types/product';
import { Category } from '../../core/types/category';

export function docToProduct(doc: DocumentSnapshot): Product {
  const data = doc.data();
  if (!data) throw new Error(`Product document ${doc.id} has no data`);
  return {
    id: doc.id,
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

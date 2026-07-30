import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  QueryConstraint,
} from 'firebase/firestore';
import { getDb } from '../../config/firebase';
import {
  ProductRepository,
  ProductPayload,
  ProductListOptions,
  ProductListResult,
} from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';
import { docToProduct } from './firebase-mapper';

const COLLECTION = 'products';
const DEFAULT_LIMIT = 24;

const SORT_FIELDS: Record<string, [string, 'asc' | 'desc']> = {
  'price-asc': ['price', 'asc'],
  'price-desc': ['price', 'desc'],
  'rating-desc': ['rating.rate', 'desc'],
};

export class FirebaseProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map(docToProduct);
  }

  async list(options: ProductListOptions = {}): Promise<ProductListResult> {
    const { category, sort, search, cursor } = options;
    const pageSize = options.limit ?? DEFAULT_LIMIT;

    if (search) {
      return this.listClientSide({ ...options, search });
    }

    const db = getDb();
    const constraints: QueryConstraint[] = [];
    constraints.push(where('isActive', '==', true));

    if (category) {
      constraints.push(where('category', '==', category));
    }

    if (sort && sort !== 'default') {
      const [field, dir] = SORT_FIELDS[sort];
      constraints.push(orderBy(field, dir));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    constraints.push(firestoreLimit(pageSize));

    if (cursor) {
      const cursorRef = doc(db, COLLECTION, cursor);
      const cursorSnap = await getDoc(cursorRef);
      if (cursorSnap.exists()) {
        constraints.push(startAfter(cursorSnap));
      }
    }

    const snapshot = await getDocs(
      query(collection(db, COLLECTION), ...constraints)
    );

    const docs = snapshot.docs;
    const hasMore = docs.length === pageSize;

    return {
      products: docs.map(docToProduct),
      hasMore,
      cursor: docs.length > 0 ? docs[docs.length - 1].id : null,
    };
  }

  private async listClientSide(options: ProductListOptions): Promise<ProductListResult> {
    const { category, sort, search, cursor } = options;
    const pageSize = options.limit ?? DEFAULT_LIMIT;

    let result = (await this.getAll()).filter((p) => p.isActive);

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    result = this.sortProducts(result, sort);

    let startIndex = 0;
    if (cursor) {
      const idx = result.findIndex((p) => p.id === cursor);
      if (idx !== -1) startIndex = idx + 1;
    }

    const paged = result.slice(startIndex, startIndex + pageSize);

    return {
      products: paged,
      hasMore: startIndex + pageSize < result.length,
      cursor: paged.length > 0 ? paged[paged.length - 1].id : null,
    };
  }

  private sortProducts(products: Product[], sort?: string): Product[] {
    const sorted = [...products];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }

  async getById(id: string): Promise<Product | null> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToProduct(snapshot);
  }

  async create(payload: ProductPayload): Promise<Product> {
    const db = getDb();
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await getDoc(ref);
    return docToProduct(snapshot);
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const data = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, data);
    const snapshot = await getDoc(ref);
    return docToProduct(snapshot);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
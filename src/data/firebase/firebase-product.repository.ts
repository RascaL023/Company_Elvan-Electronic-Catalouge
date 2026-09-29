import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from 'firebase/firestore/lite';
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

// --- CACHE MECHANISM ---
let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 8 * 60 * 1000; // 8 minutes

export class FirebaseProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const now = Date.now();
    if (cachedProducts && (now - cacheTimestamp < CACHE_TTL)) {
      return cachedProducts;
    }

    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    );
    cachedProducts = snapshot.docs.map(docToProduct);
    cacheTimestamp = now;
    return cachedProducts;
  }

  async list(options: ProductListOptions = {}): Promise<ProductListResult> {
    // Karena kita memakai cache, semua list, filter, sort, dan pagination
    // diproses sepenuhnya di client-side (gratis read dan instan 0 latency).
    // Kontraknya tetap application-level (lihat ProductListOptions), jadi
    // implementasi API di masa depan boleh mengerjakannya server-side
    // tanpa mengubah pemanggil.
    return this.listClientSide(options);
  }

  private async listClientSide(options: ProductListOptions): Promise<ProductListResult> {
    const { category, sort, search, cursor } = options;
    const pageSize = options.limit ?? DEFAULT_LIMIT;

    let result = await this.getAll();
    if (!options.includeInactive) {
      result = result.filter((p) => p.isActive);
    }

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
    // Cek cache dulu, kalau ada pakai cache. (Lebih hemat baca)
    if (cachedProducts) {
      const found = cachedProducts.find(p => p.id === id);
      if (found) return found;
    }

    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToProduct(snapshot);
  }

  async create(payload: ProductPayload): Promise<Product> {
    const db = getDb();
    const now = new Date().toISOString();
    const { id, ...rest } = payload;
    const data = {
      ...rest,
      createdAt: now,
      updatedAt: now,
    };
    
    let product: Product;
    if (id) {
      const ref = doc(db, COLLECTION, id);
      await setDoc(ref, data);
      const snapshot = await getDoc(ref);
      product = docToProduct(snapshot);
    } else {
      const ref = await addDoc(collection(db, COLLECTION), data);
      const snapshot = await getDoc(ref);
      product = docToProduct(snapshot);
    }

    // Update cache secara reaktif
    if (cachedProducts) {
      cachedProducts = [product, ...cachedProducts];
    }
    return product;
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const { id: _id, ...rest } = payload;
    const data = {
      ...rest,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, data);
    const snapshot = await getDoc(ref);
    const product = docToProduct(snapshot);

    // Update cache secara reaktif
    if (cachedProducts) {
      cachedProducts = cachedProducts.map(p => p.id === id ? product : p);
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, COLLECTION, id));

    // Update cache secara reaktif
    if (cachedProducts) {
      cachedProducts = cachedProducts.filter(p => p.id !== id);
    }
  }
}
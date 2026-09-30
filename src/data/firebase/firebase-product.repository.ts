import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  orderBy,
  query,
  runTransaction,
  type Transaction,
  type DocumentData,
} from 'firebase/firestore/lite';
import { getDb } from '../../config/firebase';
import {
  ProductRepository,
  ProductPayload,
  ProductListOptions,
  ProductListResult,
} from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';
import { CatalogProduct, CatalogSnapshot, toCatalogProduct } from '../../core/types/catalog';
import { docToProduct, productFromData, snapshotFromData } from './firebase-mapper';

const COLLECTION = 'products';
const CATALOG_COLLECTION = 'catalog';
const SNAPSHOT_DOC = 'snapshot';
const DEFAULT_LIMIT = 24;

/**
 * Thrown when `catalog/snapshot` has not been generated yet. Callers in
 * the mutation path catch this to bootstrap the snapshot from
 * `products/*` — the public read path deliberately does NOT fall back to
 * a full collection query, which is exactly what this change removes.
 */
class SnapshotNotInitializedError extends Error {
  constructor() {
    super(
      'catalog/snapshot does not exist yet. Run `npm run rebuild:catalog` ' +
        '(or seed the project) to generate it.'
    );
    this.name = 'SnapshotNotInitializedError';
  }
}

// --- CACHE MECHANISM ---
// The catalog is now a single document. Caching it in memory for a few
// minutes turns repeated in-session navigations into zero reads.
let cachedCatalog: CatalogProduct[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 8 * 60 * 1000; // 8 minutes

function snapshotRef() {
  const db = getDb();
  return doc(db, CATALOG_COLLECTION, SNAPSHOT_DOC);
}

function upsertCatalog(list: CatalogProduct[], item: CatalogProduct): CatalogProduct[] {
  const index = list.findIndex((p) => p.id === item.id);
  if (index === -1) return [...list, item];
  const next = [...list];
  next[index] = item;
  return next;
}

export class FirebaseProductRepository implements ProductRepository {
  /**
   * Public catalog read path: ONE `getDoc(catalog/snapshot)` regardless
   * of how many products exist. Never queries the whole `products`
   * collection.
   */
  async getAll(): Promise<CatalogProduct[]> {
    const now = Date.now();
    if (cachedCatalog && now - cacheTimestamp < CACHE_TTL) {
      return cachedCatalog;
    }

    const snapshot = await getDoc(snapshotRef());
    if (!snapshot.exists()) {
      throw new SnapshotNotInitializedError();
    }

    const products = snapshotFromData(snapshot.data()).products;
    cachedCatalog = products;
    cacheTimestamp = now;
    return products;
  }

  async list(options: ProductListOptions = {}): Promise<ProductListResult> {
    // Semua list, filter, sort, dan pagination diproses sepenuhnya di
    // client-side dari data snapshot (0 read tambahan). Kontraknya tetap
    // application-level, jadi implementasi API di masa depan boleh
    // mengerjakannya server-side tanpa mengubah pemanggil.
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

  private sortProducts(products: CatalogProduct[], sort?: string): CatalogProduct[] {
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

  /**
   * Full product detail — read from the canonical `products/{id}` doc.
   * The catalog snapshot intentionally does not carry detail-only fields
   * (description, full image array, image file ids).
   */
  async getById(id: string): Promise<Product | null> {
    const ref = doc(getDb(), COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToProduct(snapshot);
  }

  async create(payload: ProductPayload): Promise<Product> {
    const db = getDb();
    const now = new Date().toISOString();
    const { id, ...rest } = payload;
    // `doc()` gives us an id without writing, so the create can happen
    // inside the snapshot transaction atomically.
    const ref = id ? doc(db, COLLECTION, id) : doc(collection(db, COLLECTION));
    const data = { ...rest, createdAt: now, updatedAt: now };
    const product: Product = { ...rest, id: ref.id, createdAt: now, updatedAt: now };

    try {
      await this.runSnapshotMutation((tx, snapshot) => {
        tx.set(ref, data);
        return {
          next: upsertCatalog(snapshot.products, toCatalogProduct(product)),
          result: undefined,
        };
      });
    } catch (err) {
      if (err instanceof SnapshotNotInitializedError) {
        await setDoc(ref, data);
        await this.rebuildSnapshot();
      } else {
        throw err;
      }
    }

    if (cachedCatalog) {
      cachedCatalog = upsertCatalog(cachedCatalog, toCatalogProduct(product));
    }
    return product;
  }

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const { id: _id, ...rest } = payload;
    const now = new Date().toISOString();

    let product: Product;
    try {
      product = await this.runSnapshotMutation((tx, snapshot) => {
        const projected = snapshot.products.find((p) => p.id === id);
        // In a transaction all reads must come before writes; read both
        // the snapshot and the product first, then write.
        return tx.get(ref).then((existing) => {
          if (!existing.exists()) {
            throw new Error(`Product with id "${id}" not found`);
          }
          const merged: DocumentData = {
            ...existing.data(),
            ...rest,
            updatedAt: now,
          };
          const updated = productFromData(id, merged);
          tx.set(ref, merged);
          return {
            next: projected
              ? upsertCatalog(snapshot.products, toCatalogProduct(updated))
              : [...snapshot.products, toCatalogProduct(updated)],
            result: updated,
          };
        });
      });
    } catch (err) {
      if (err instanceof SnapshotNotInitializedError) {
        await updateDoc(ref, { ...rest, updatedAt: now });
        const after = await getDoc(ref);
        product = productFromData(id, after.data() ?? {});
        await this.rebuildSnapshot();
      } else {
        throw err;
      }
    }

    if (cachedCatalog) {
      cachedCatalog = upsertCatalog(cachedCatalog, toCatalogProduct(product));
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);

    try {
      await this.runSnapshotMutation((_tx, snapshot) => {
        _tx.delete(ref);
        return {
          next: snapshot.products.filter((p) => p.id !== id),
          result: undefined,
        };
      });
    } catch (err) {
      if (err instanceof SnapshotNotInitializedError) {
        await deleteDoc(ref);
        await this.rebuildSnapshot();
      } else {
        throw err;
      }
    }

    if (cachedCatalog) {
      cachedCatalog = cachedCatalog.filter((p) => p.id !== id);
    }
  }

  /**
   * Read the snapshot and write the product mutation + the new snapshot
   * in a single transaction, so a successful mutation can never leave
   * the catalog permanently stale.
   */
  private async runSnapshotMutation<T>(
    apply: (
      tx: Transaction,
      snapshot: CatalogSnapshot
    ) => { next: CatalogProduct[]; result: T } | Promise<{ next: CatalogProduct[]; result: T }>
  ): Promise<T> {
    const db = getDb();
    const ref = snapshotRef();
    return runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        throw new SnapshotNotInitializedError();
      }
      const snapshot = snapshotFromData(snap.data());
      const { next, result } = await apply(tx, snapshot);
      tx.set(ref, {
        version: snapshot.version + 1,
        updatedAt: new Date().toISOString(),
        products: next,
      });
      return result;
    });
  }

  /**
   * Regenerate the whole `catalog/snapshot` from `products/*`. Used to
   * bootstrap a missing snapshot and by the rebuild script after bulk
   * Admin-SDK writes. This is the ONLY place that queries the full
   * collection.
   */
  async rebuildSnapshot(): Promise<CatalogProduct[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    );
    const products = snapshot.docs.map((d) => toCatalogProduct(docToProduct(d)));

    await setDoc(snapshotRef(), {
      version: 1,
      updatedAt: new Date().toISOString(),
      products,
    });

    cachedCatalog = products;
    cacheTimestamp = Date.now();
    return products;
  }
}

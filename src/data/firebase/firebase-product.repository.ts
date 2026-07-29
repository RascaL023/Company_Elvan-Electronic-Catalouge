import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDb } from '../../config/firebase';
import { ProductRepository, ProductPayload } from '../../core/repositories/product.repository';
import { Product } from '../../core/types/product';
import { docToProduct } from './firebase-mapper';

const COLLECTION = 'products';

export class FirebaseProductRepository implements ProductRepository {
  async getAll(): Promise<Product[]> {
    const db = getDb();
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map(docToProduct);
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

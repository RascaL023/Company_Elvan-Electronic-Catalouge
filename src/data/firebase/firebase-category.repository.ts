import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from '../../config/firebase';
import { CategoryRepository } from '../../core/repositories/category.repository';
import { Category, CategoryPayload } from '../../core/types/category';

const COLLECTION = 'categories';

export class FirebaseCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = getDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(this.docToCategory);
  }

  async getById(id: string): Promise<Category | null> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return this.docToCategory(snapshot);
  }

  async create(payload: CategoryPayload): Promise<Category> {
    const db = getDb();
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await getDoc(ref);
    return this.docToCategory(snapshot);
  }

  async update(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const data = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, data);
    const snapshot = await getDoc(ref);
    return this.docToCategory(snapshot);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }

  private docToCategory(doc: import('firebase/firestore').DocumentSnapshot): Category {
    const data = doc.data();
    if (!data) throw new Error(`Category document ${doc.id} has no data`);
    return {
      id: doc.id,
      name: data.name ?? '',
      slug: data.slug ?? '',
      description: data.description ?? '',
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt ?? undefined),
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt ?? undefined),
    };
  }
}

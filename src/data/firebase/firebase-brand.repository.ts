import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore/lite';
import { getDb } from '../../config/firebase';
import { BrandRepository } from '../../core/repositories/brand.repository';
import { Brand, BrandPayload } from '../../core/types/brand';

const COLLECTION = 'brands';

export class FirebaseBrandRepository implements BrandRepository {
  async getAll(): Promise<Brand[]> {
    const db = getDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(this.docToBrand);
  }

  async getById(id: string): Promise<Brand | null> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return this.docToBrand(snapshot);
  }

  async create(payload: BrandPayload): Promise<Brand> {
    const db = getDb();
    const now = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    const snapshot = await getDoc(ref);
    return this.docToBrand(snapshot);
  }

  async update(id: string, payload: Partial<BrandPayload>): Promise<Brand> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const data = {
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(ref, data);
    const snapshot = await getDoc(ref);
    return this.docToBrand(snapshot);
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }

  private docToBrand(doc: DocumentSnapshot): Brand {
    const data = doc.data();
    if (!data) throw new Error(`Brand document ${doc.id} has no data`);
    return {
      id: doc.id,
      name: data.name ?? '',
      slug: data.slug ?? '',
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt ?? undefined),
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt ?? undefined),
    };
  }
}

import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDb } from '../../config/firebase';
import { CategoryRepository } from '../../core/repositories/category.repository';
import { Category } from '../../core/types/category';
import { docToCategory } from './firebase-mapper';

const COLLECTION = 'categories';

export class FirebaseCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = getDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(docToCategory);
  }

  async getById(id: string): Promise<Category | null> {
    const db = getDb();
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return docToCategory(snapshot);
  }
}

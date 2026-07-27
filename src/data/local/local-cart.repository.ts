import { CartItem } from '../../core/types/cart';
import { CartRepository } from '../../core/repositories/cart.repository';

const STORAGE_KEY = 'electroshop-cart';

export class LocalCartRepository implements CartRepository {
  async load(): Promise<CartItem[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async save(items: CartItem[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage quota exceeded
    }
  }
}

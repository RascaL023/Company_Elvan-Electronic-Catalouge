import { CartItem } from '../types/cart';

export interface CartRepository {
  load(): Promise<CartItem[]>;
  save(items: CartItem[]): Promise<void>;
}

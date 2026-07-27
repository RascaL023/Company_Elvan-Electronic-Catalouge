import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../core/types/product';
import { CartItem } from '../core/types/cart';
import { useRepository } from './useRepository';

interface CartState {
  items: CartItem[];
  loaded: boolean;
}

type CartAction =
  | { type: 'LOAD'; items: CartItem[] }
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD':
      return { ...state, items: action.items, loaded: true };
    case 'ADD': {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter(
          (i) => i.product.id !== action.productId
        ),
      };
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.product.id !== action.productId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case 'CLEAR':
      return { ...state, items: [] };
  }
}

export function useCart() {
  const { cartRepository } = useRepository();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loaded: false,
  });

  useEffect(() => {
    cartRepository.load().then((items) => {
      dispatch({ type: 'LOAD', items });
    });
  }, [cartRepository]);

  useEffect(() => {
    if (state.loaded) {
      cartRepository.save(state.items);
    }
  }, [state.items, state.loaded, cartRepository]);

  const addToCart = useCallback((product: Product) => {
    dispatch({ type: 'ADD', product });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const cartCount = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      ),
    [state.items]
  );

  return {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
  };
}

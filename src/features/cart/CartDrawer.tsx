import { Link } from 'react-router-dom';
import { Drawer } from '../../components/ui/Drawer';
import { useCart } from '../../hooks/useCart';
import { useUiContext } from '../../services/UiProvider';
import { CartItemRow } from './CartItemRow';
import { formatPrice } from '../../utils/formatters';

export function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer } = useUiContext();
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      title="Shopping Cart"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg
            className="w-12 h-12 mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <p className="text-sm">Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
              variant="compact"
            />
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between text-base font-semibold text-gray-900 mb-4">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/cart"
            onClick={closeCartDrawer}
            className="block w-full text-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}
    </Drawer>
  );
}

import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { CartItemRow } from './CartItemRow';
import { CartSummary } from './CartSummary';

export function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, subtotal } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Shopping Cart
        </h1>
        <p className="text-gray-500 mb-8">Your cart is empty</p>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Shopping Cart
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
              variant="full"
            />
          ))}
        </div>
        <div className="lg:w-80">
          <CartSummary subtotal={subtotal} />
          <button className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Proceed to Checkout
          </button>
          <button
            onClick={clearCart}
            className="w-full mt-2 px-6 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

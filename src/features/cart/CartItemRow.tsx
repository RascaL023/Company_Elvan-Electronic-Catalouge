import { Link } from 'react-router-dom';
import { CartItem } from '../../core/types/cart';
import { formatPrice } from '../../utils/formatters';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  variant?: 'compact' | 'full';
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  variant = 'full',
}: CartItemRowProps) {
  const imgClass = variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16';
  const boxClass = variant === 'compact' ? 'w-16 h-16' : 'w-20 h-20';

  return (
    <div
      className={`flex gap-4 ${
        variant === 'compact' ? '' : 'bg-white rounded-xl shadow-sm p-4'
      }`}
    >
      <div
        className={`${boxClass} bg-gray-50 rounded-lg flex items-center justify-center shrink-0`}
      >
        <img
          src={item.product.image}
          alt={item.product.title}
          className={`${imgClass} object-contain`}
        />
      </div>
      <div className="flex-1 min-w-0">
        {variant === 'compact' ? (
          <p className="text-sm font-medium text-gray-900 truncate">
            {item.product.title}
          </p>
        ) : (
          <Link
            to={`/product/${item.product.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block"
          >
            {item.product.title}
          </Link>
        )}
        <p className="text-sm font-semibold text-indigo-600 mt-1">
          {formatPrice(item.product.price)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            +
          </button>
          <button
            onClick={() => onRemove(item.product.id)}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
      {variant !== 'compact' && (
        <div className="text-right shrink-0">
          <p className="font-semibold text-gray-900">
            {formatPrice(item.product.price * item.quantity)}
          </p>
        </div>
      )}
    </div>
  );
}

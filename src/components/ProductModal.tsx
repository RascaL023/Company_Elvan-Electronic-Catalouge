import { useEffect } from 'react';
import { Product } from '../types/product';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const starCount = Math.round(product.rating.rate);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.title}
                className="w-full max-w-[250px] h-auto object-contain"
              />
            </div>
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-4">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start uppercase tracking-wide">
                {product.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">
                  {'★'.repeat(starCount)}
                  {'☆'.repeat(5 - starCount)}
                </span>
                <span className="text-sm text-gray-500">
                  {product.rating.rate} ({product.rating.count} reviews)
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                <span className="text-3xl font-bold text-indigo-600">
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

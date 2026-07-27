import { Link } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Rating } from '../../components/ui/Rating';
import { Product } from '../../core/types/product';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
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
            <Rating rate={product.rating.rate} count={product.rating.count} />
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Full Details &rarr;
            </Link>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-3xl font-bold text-indigo-600">
                {formatPrice(product.price)}
              </span>
              <Button onClick={handleAddToCart}>Add to Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

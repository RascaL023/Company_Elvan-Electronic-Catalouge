import { Link } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';
import { Rating } from '../../components/ui/Rating';
import { Product } from '../../core/types/product';
import { formatPrice } from '../../utils/formatters';
import { getCategoryName } from '../../utils/categories';
import { ImageService } from '../../services/imageService';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
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
              src={ImageService.getDetailUrl(product.images[0] || '')}
              alt={product.name}
              className="w-full max-w-[250px] h-auto object-contain"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-4">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start uppercase tracking-wide">
              {getCategoryName(product.category)}
            </span>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h2>
            <Rating rate={product.rating.rate} count={product.rating.count} />
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
              <span className="text-3xl font-bold text-indigo-600">
                {formatPrice(product.price)}
              </span>
              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Detail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
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
    <Modal open={true} onClose={onClose} maxWidthClass="max-w-2xl lg:max-w-4xl">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-surface rounded-full shadow flex items-center justify-center text-ink-muted hover:text-ink-secondary transition-colors"
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
          <div className="md:w-1/2 p-8 bg-surface-alt flex items-center justify-center">
            <img
              src={ImageService.getDetailUrl(product.images[0] || '')}
              alt={product.name}
              className="w-full max-w-[250px] h-auto object-contain text-sm text-ink-muted text-center"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-4">
            <span className="text-xs font-medium text-ink-secondary bg-surface-hover px-2 py-1 rounded-full self-start uppercase tracking-wide">
              {getCategoryName(product.category)}
            </span>
            <h2 className="text-xl font-bold text-ink leading-tight">
              {product.name}
            </h2>
            <Rating rate={product.rating.rate} count={product.rating.count} />
            <p className="text-ink-secondary text-sm leading-relaxed">
              {product.description}
            </p>
            <div className="mt-auto pt-4 flex flex-row lg:flex-col justify-between items-center lg:items-end lg:gap-4 border-t border-border">
              <div className="flex justify-start w-full">
                <span className="text-3xl lg:text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              </div>
              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-primary bg-primary-bg hover:bg-primary hover:text-primary-text rounded-lg transition-colors shrink-0"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

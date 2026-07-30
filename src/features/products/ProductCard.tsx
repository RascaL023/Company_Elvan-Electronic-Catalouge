import { Link } from 'react-router-dom';
import { Product } from '../../core/types/product';
import { formatPrice } from '../../utils/formatters';
import { getCategoryName } from '../../utils/categories';
import { Rating } from '../../components/ui/Rating';
import { ImageService } from '../../services/imageService';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const primaryImage = ImageService.getPrimaryUrl(product.images);
  const thumbnailUrl = ImageService.getThumbnailUrl(primaryImage);

  return (
    <div className="bg-surface rounded-xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group border border-border">
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-square bg-surface-alt p-6 sm:p-8 flex items-center justify-center overflow-hidden"
      >
        <img
          src={thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 text-xs text-ink-muted text-center"
          loading="lazy"
        />
        {/* Desktop Hover Overlay Minimalist */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden lg:block pointer-events-none translate-y-[-10px] group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="pointer-events-auto flex items-center justify-center w-9 h-9 bg-surface/90 backdrop-blur-sm text-ink-secondary hover:text-primary hover:bg-surface rounded-full shadow-md transition-colors"
            title="Quick View"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-xs font-medium text-ink-secondary bg-surface-hover px-2 py-1 rounded-full self-start uppercase tracking-wide">
          {getCategoryName(product.category)}
        </span>
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-ink line-clamp-2 leading-snug hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <Rating rate={product.rating.rate} count={product.rating.count} />
        <div className="mt-auto pt-2 flex items-center gap-3">
          <span className="text-xl sm:text-2xl lg:text-xl min-[650px]:max-[740px]:text-base font-bold text-primary shrink min-w-0 truncate">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="lg:hidden ml-auto shrink-0 px-3 py-1.5 min-[650px]:max-[740px]:px-2 text-xs sm:text-sm min-[650px]:max-[740px]:text-[11px] font-medium text-primary bg-primary-bg hover:bg-primary hover:text-primary-text rounded-lg transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

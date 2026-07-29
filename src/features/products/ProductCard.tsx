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
    <div className="bg-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-border">
      <Link
        to={`/product/${product.id}`}
        className="aspect-square bg-surface-alt p-6 sm:p-8 flex items-center justify-center overflow-hidden"
      >
        <img
          src={thumbnailUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
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
          <span className="text-xl sm:text-2xl font-bold text-primary shrink min-w-0">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="ml-auto shrink-0 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary bg-primary-bg hover:bg-primary hover:text-primary-text rounded-lg transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

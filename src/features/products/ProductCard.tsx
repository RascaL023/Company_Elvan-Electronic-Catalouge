import { Link } from 'react-router-dom';
import { Product } from '../../core/types/product';
import { formatPrice } from '../../utils/formatters';
import { getCategoryName } from '../../utils/categories';
import { Rating } from '../../components/ui/Rating';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      <Link
        to={`/product/${product.id}`}
        className="aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start uppercase tracking-wide">
          {getCategoryName(product.category)}
        </span>
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-indigo-600 transition-colors"
        >
          {product.title}
        </Link>
        <Rating rate={product.rating.rate} count={product.rating.count} />
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

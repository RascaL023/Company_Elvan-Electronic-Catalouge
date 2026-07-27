import { Product } from '../types/product';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const starCount = Math.round(product.rating.rate);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-400">
            {'★'.repeat(starCount)}
            {'☆'.repeat(5 - starCount)}
          </span>
          <span className="text-gray-500 ml-1">{product.rating.rate}</span>
          <span className="text-gray-400 text-xs">
            ({product.rating.count})
          </span>
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onQuickView(product)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

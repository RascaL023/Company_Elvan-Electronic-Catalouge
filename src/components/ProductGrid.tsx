import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from './SkeletonCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onQuickView: (product: Product) => void;
}

export function ProductGrid({ products, loading, onQuickView }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}

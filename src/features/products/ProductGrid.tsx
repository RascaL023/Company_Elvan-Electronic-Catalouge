import { Product } from '../../core/types/product';
import { ProductCard } from './ProductCard';
import { LoadingGrid } from '../../components/feedback/LoadingGrid';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onQuickView: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  onQuickView,
}: ProductGridProps) {
  if (loading) {
    return <LoadingGrid />;
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

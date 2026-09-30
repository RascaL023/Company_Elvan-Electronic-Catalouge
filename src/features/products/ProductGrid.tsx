import { CatalogProduct } from '../../core/types/catalog';
import { ProductCard } from './ProductCard';
import { LoadingGrid } from '../../components/feedback/LoadingGrid';
import { Reveal } from '../../components/ui/Reveal';

interface ProductGridProps {
  products: CatalogProduct[];
  loading: boolean;
  onQuickView: (product: CatalogProduct) => void;
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
      {products.map((product, index) => (
        <Reveal key={product.id} delay={Math.min(index * 60, 480)}>
          <ProductCard
            product={product}
            onQuickView={onQuickView}
          />
        </Reveal>
      ))}
    </div>
  );
}

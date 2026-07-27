import { useState } from 'react';
import { Product, SortOption } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import { ProductGrid } from '../components/ProductGrid';
import { SortControl } from '../components/SortControl';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { ProductModal } from '../components/ProductModal';

interface HomePageProps {
  search: string;
}

export function HomePage({ search }: HomePageProps) {
  const [sort, setSort] = useState<SortOption>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { products, loading, error, refetch } = useProducts(
    debouncedSearch,
    sort
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Electronics</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Loading...' : `${products.length} products available`}
          </p>
        </div>
        <SortControl value={sort} onChange={setSort} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !loading && products.length === 0 ? (
        <EmptyState query={debouncedSearch} />
      ) : (
        <ProductGrid
          products={products}
          loading={loading}
          onQuickView={setSelectedProduct}
        />
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}

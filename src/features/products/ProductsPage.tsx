import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../../core/types/product';
import { SortOption } from '../../core/types/common';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductGrid } from './ProductGrid';
import { SortControl } from './SortControl';
import { ProductModal } from './ProductModal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { EmptyState } from '../../components/feedback/EmptyState';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'default';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const { products, loading, error, refetch } = useProducts(
    debouncedSearch,
    sort
  );

  const handleSortChange = (value: SortOption) => {
    setSearchParams((prev) => {
      if (value !== 'default') prev.set('sort', value);
      else prev.delete('sort');
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Electronics</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading
              ? 'Loading...'
              : `${products.length} products available`}
          </p>
        </div>
        <SortControl value={sort} onChange={handleSortChange} />
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
    </div>
  );
}

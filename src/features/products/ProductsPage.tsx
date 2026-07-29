import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../../core/types/product';
import { SortOption } from '../../core/types/common';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
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
  const category = searchParams.get('category') || null;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { categories } = useCategories();
  const debouncedSearch = useDebounce(search, 300);
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useProducts(debouncedSearch, sort, category);

  const handleSortChange = (value: SortOption) => {
    setSearchParams((prev) => {
      if (value !== 'default') prev.set('sort', value);
      else prev.delete('sort');
      return prev;
    });
  };

  const handleCategoryChange = (slug: string | null) => {
    setSearchParams((prev) => {
      if (slug) prev.set('category', slug);
      else prev.delete('category');
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-end mb-6">
        <SortControl value={sort} onChange={handleSortChange} />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-primary text-primary-text'
              : 'bg-surface-hover text-ink-secondary hover:bg-surface-hover'
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-primary text-primary-text'
                : 'bg-surface-hover text-ink-secondary hover:bg-surface-hover'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !loading && products.length === 0 ? (
        <EmptyState query={debouncedSearch} />
      ) : (
        <>
          <ProductGrid
            products={products}
            loading={loading}
            onQuickView={setSelectedProduct}
          />
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-primary text-primary-text font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
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

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CatalogProduct } from '../../core/types/catalog';
import { SortOption } from '../../core/types/common';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
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
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const { categories } = useCategories();
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useProducts(search, sort, category);

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

  const getSortLabel = (sortValue: SortOption) => {
    switch (sortValue) {
      case 'price-asc': return 'harga terendah';
      case 'price-desc': return 'harga tertinggi';
      case 'rating-desc': return 'rating terbaik';
      default: return 'rekomendasi pilihan';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-4 animate-fade-up">
          Katalog Elektronik
        </h1>
        <p
          className="text-ink-secondary text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          Temukan berbagai perangkat elektronik terbaik dengan harga kompetitif untuk melengkapi kebutuhan rumah dan gaya hidup modern Anda.
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 animate-fade-up ${
              !category
                ? 'bg-primary text-primary-text shadow-sm'
                : 'bg-surface-alt text-ink-secondary hover:bg-primary-bg hover:text-primary'
            }`}
          >
            Semua
          </button>
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 animate-fade-up ${
                category === cat.slug
                  ? 'bg-primary text-primary-text shadow-sm'
                  : 'bg-surface-alt text-ink-secondary hover:bg-primary-bg hover:text-primary'
              }`}
              style={{ animationDelay: `${120 + (index + 1) * 50}ms` }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-border pt-6 mt-2 animate-fade-up"
          style={{ animationDelay: '260ms' }}
        >
          <span className="text-sm text-ink-muted">
            Menampilkan berdasarkan {getSortLabel(sort)}
          </span>
          <div className="w-full sm:w-auto">
            <SortControl value={sort} onChange={handleSortChange} />
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !loading && products.length === 0 ? (
        <EmptyState query={search} />
      ) : (
        <>
          <ProductGrid
            products={products}
            loading={loading}
            onQuickView={setSelectedProduct}
          />
          {hasMore && (
            <div className="mt-8 text-center animate-fade-in">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-primary text-primary-text font-medium rounded-lg hover:bg-primary-dark hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

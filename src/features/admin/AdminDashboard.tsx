import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product } from '../../core/types/product';
import { useRepository } from '../../hooks/useRepository';
import { getCategoryName } from '../../utils/categories';
import { formatPrice } from '../../utils/formatters';
import { ImageService } from '../../services/imageService';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const PAGE_SIZE = 10;

export function AdminDashboard() {
  const { productRepository } = useRepository();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productRepository.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [productRepository]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeletingId(id);
    try {
      await productRepository.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const tabs = [
    { label: 'Products', href: '/admin', active: true },
    { label: 'Categories', href: '/admin/categories', active: false },
    { label: 'Brands', href: '/admin/brands', active: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            to={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab.active
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-ink-muted'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Admin Panel</h1>
        {searchQuery && (
          <p className="text-sm text-ink-muted mt-1">
            Menampilkan hasil untuk "<span className="font-medium text-ink">{searchQuery}</span>"
            {' '}({filtered.length} produk ditemukan)
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-hover rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <button
            onClick={load}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-surface rounded-lg border border-border p-12 text-center">
          <p className="text-ink-muted">
            {searchQuery ? `No products matching "${searchQuery}".` : 'No products yet.'}
          </p>
          <Link
            to="/admin/products/new"
            className="mt-2 inline-block text-primary font-medium hover:underline"
          >
            Add your first product
          </Link>
        </div>
      )}

      {/* Product Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-surface rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-center px-2 py-3 font-medium text-ink-secondary w-10">No</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Category</th>
                <th className="text-right px-4 py-3 font-medium text-ink-secondary">Price</th>
                <th className="text-center px-4 py-3 font-medium text-ink-secondary">Active</th>
                <th className="text-right px-4 py-3 font-medium text-ink-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product, idx) => (
                <tr key={product.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-2 py-3 text-center text-sm text-ink-muted">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-hover rounded-lg overflow-hidden shrink-0">
                        {product.images[0] && (
                          <img
                            src={ImageService.getThumbnailUrl(product.images[0])}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-ink line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary">{getCategoryName(product.category)}</td>
                  <td className="px-4 py-3 text-right font-medium text-ink">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-ink-muted'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg hover:bg-primary hover:text-primary-text rounded-md transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        disabled={deletingId === product.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-alt">
              <span className="text-sm text-ink-muted">
                {filtered.length} produk total
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                      p === safePage
                        ? 'bg-primary text-primary-text'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        loading={!!deletingId}
      />

      {/* Floating Action Button */}
      <Link
        to="/admin/products/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-text rounded-full shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        title="Add Product"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}

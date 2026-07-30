import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Category } from '../../core/types/category';
import { useRepository } from '../../hooks/useRepository';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const PAGE_SIZE = 10;

export function AdminCategoryList() {
  const { categoryRepository } = useRepository();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryRepository.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [categoryRepository]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    if (!searchQuery) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryRepository.delete(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { label: 'Products', href: '/admin', active: false },
    { label: 'Categories', href: '/admin/categories', active: true },
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
        <h1 className="text-2xl font-bold text-ink">Categories</h1>
        {searchQuery && (
          <p className="text-sm text-ink-muted mt-1">
            Menampilkan hasil untuk "<span className="font-medium text-ink">{searchQuery}</span>"
            {' '}({filtered.length} kategori ditemukan)
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
            {searchQuery ? `No categories matching "${searchQuery}".` : 'No categories yet.'}
          </p>
          <Link
            to="/admin/categories/new"
            className="mt-2 inline-block text-primary font-medium hover:underline"
          >
            Add your first category
          </Link>
        </div>
      )}

      {/* Category Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="bg-surface rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-center px-2 py-3 font-medium text-ink-secondary w-10">No</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-ink-secondary hidden md:table-cell">Description</th>
                <th className="text-right px-4 py-3 font-medium text-ink-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((cat, idx) => (
                <tr key={cat.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                  <td className="px-2 py-3 text-center text-sm text-ink-muted">{(safePage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{cat.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted hidden sm:table-cell">
                    <code className="text-xs bg-surface-alt px-1.5 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-ink-secondary text-xs hidden md:table-cell line-clamp-1">
                    {cat.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/categories/${cat.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg hover:bg-primary hover:text-primary-text rounded-md transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        disabled={deleting}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                      >
                        {deleting ? '...' : 'Delete'}
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
                {filtered.length} kategori total
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
        title="Delete Category"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />

      {/* Floating Action Button */}
      <Link
        to="/admin/categories/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-text rounded-full shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        title="Add Category"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}

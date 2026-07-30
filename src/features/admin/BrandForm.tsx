import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRepository } from '../../hooks/useRepository';

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function BrandForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { brandRepository } = useRepository();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    setError(null);
    brandRepository
      .getById(id!)
      .then((brand) => {
        if (!brand) {
          setError('Brand not found');
          return;
        }
        setName(brand.name);
        setSlug(brand.slug);
        setSlugEdited(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load brand'))
      .finally(() => setLoading(false));
  }, [id, isEdit, brandRepository]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await brandRepository.update(id!, {
          name: name.trim(),
          slug: slug.trim(),
        });
      } else {
        await brandRepository.create({
          name: name.trim(),
          slug: slug.trim(),
        });
      }
      navigate('/admin/brands');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-hover rounded w-1/3" />
          <div className="h-10 bg-surface-hover rounded" />
          <div className="h-10 bg-surface-hover rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">
          {isEdit ? 'Edit Brand' : 'New Brand'}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {isEdit ? 'Update the brand details below.' : 'Create a new product brand.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Samsung"
            required
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            placeholder="e.g. samsung"
            required
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow font-mono"
          />
          <p className="mt-1 text-xs text-ink-muted">
            Unique identifier used in URLs. Auto-generated from name if not edited.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/brands')}
            className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink bg-surface hover:bg-surface-hover rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim() || !slug.trim()}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-text rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

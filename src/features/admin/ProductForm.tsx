import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductPayload } from '../../core/repositories/product.repository';
import { Category } from '../../core/types/category';
import { useRepository } from '../../hooks/useRepository';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface FormData {
  name: string;
  slug: string;
  price: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  isActive: boolean;
  ratingRate: string;
  ratingCount: string;
}

const emptyForm: FormData = {
  name: '',
  slug: '',
  price: '',
  description: '',
  category: '',
  brand: '',
  images: [''],
  isActive: true,
  ratingRate: '0',
  ratingCount: '0',
};

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { productRepository, categoryRepository } = useRepository();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    categoryRepository.getAll().then(setCategories).catch(() => {});
    if (isEdit && id) {
      productRepository
        .getById(id)
        .then((product) => {
          if (product) {
            setForm({
              name: product.name,
              slug: product.slug,
              price: String(product.price),
              description: product.description,
              category: product.category,
              brand: product.brand || '',
              images:
                product.images.length > 0 ? [...product.images] : [''],
              isActive: product.isActive,
              ratingRate: String(product.rating.rate),
              ratingCount: String(product.rating.count),
            });
          } else {
            setError('Product not found');
          }
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Failed to load product')
        )
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, productRepository, categoryRepository]);

  const handleField = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugManuallyEdited) {
        next.slug = toSlug(String(value));
      }
      return next;
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...form.images];
    updated[index] = value;
    handleField('images', updated);
  };

  const addImageField = () => {
    handleField('images', [...form.images, '']);
  };

  const removeImageField = (index: number) => {
    const updated = form.images.filter((_, i) => i !== index);
    handleField('images', updated.length === 0 ? [''] : updated);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= form.images.length) return;
    const updated = [...form.images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    handleField('images', updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const price = Number(form.price);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      setSaving(false);
      return;
    }

    const payload: ProductPayload = {
      name: form.name.trim(),
      slug: form.slug || toSlug(form.name),
      price,
      description: form.description.trim(),
      category: form.category,
      brand: form.brand.trim() || undefined,
      images: form.images.filter((img) => img.trim() !== ''),
      isActive: form.isActive,
      rating: {
        rate: Math.min(5, Math.max(0, Number(form.ratingRate) || 0)),
        count: Math.max(0, Number(form.ratingCount) || 0),
      },
    };

    if (payload.images.length === 0) {
      setError('At least one image key is required');
      setSaving(false);
      return;
    }

    try {
      if (isEdit && id) {
        await productRepository.update(id, payload);
      } else {
        await productRepository.create(payload);
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-surface-hover rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-ink mb-6">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-ink">Basic Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => handleField('name', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <input
                id="slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  handleField('slug', e.target.value);
                }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="price">Price (Rp)</Label>
              <input
                id="price"
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => handleField('price', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => handleField('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <input
                id="brand"
                type="text"
                value={form.brand}
                onChange={(e) => handleField('brand', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Images</h2>
            <button
              type="button"
              onClick={addImageField}
              className="text-sm font-medium text-primary hover:text-primary-dark"
            >
              + Add Image
            </button>
          </div>
          <p className="text-xs text-ink-muted">
            First image is the primary. Drag via buttons to reorder.
          </p>

          {form.images.map((key, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-mono text-ink-muted w-6 text-right shrink-0">
                {index === 0 ? '\u2605' : index}
              </span>
              <input
                type="text"
                value={key}
                placeholder="e.g. assets/images/products/refrigerator/image.jpg"
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm font-mono bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                type="button"
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
                className="p-2 text-ink-muted hover:text-ink-secondary disabled:opacity-30"
                title="Move up"
              >
                {'\u2191'}
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 'down')}
                disabled={index === form.images.length - 1}
                className="p-2 text-ink-muted hover:text-ink-secondary disabled:opacity-30"
                title="Move down"
              >
                {'\u2193'}
              </button>
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Remove"
                >
                  {'\u00d7'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-ink">Rating & Status</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ratingRate">Rating (0\u20135)</Label>
              <input
                id="ratingRate"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.ratingRate}
                onChange={(e) => handleField('ratingRate', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="ratingCount">Review Count</Label>
              <input
                id="ratingCount"
                type="number"
                min="0"
                value={form.ratingCount}
                onChange={(e) => handleField('ratingCount', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleField('isActive', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-ink-secondary">
                  Active
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-sm font-medium text-ink-secondary bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-primary-text bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-ink-secondary mb-1"
    >
      {children}
    </label>
  );
}

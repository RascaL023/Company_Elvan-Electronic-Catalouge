import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductPayload } from '../../core/repositories/product.repository';
import { Category } from '../../core/types/category';
import { Brand } from '../../core/types/brand';
import { useRepository } from '../../hooks/useRepository';
import { generateProductId, toSlug } from '../../utils/hash';
import { ImageKitService, MAX_IMAGE_SIZE_MB } from '../../services/imagekit';
import ImageService from '../../services/imageService';
import { useToast } from '../../contexts/ToastContext';

interface FormData {
  productId: string;
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
  productId: '',
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
  const { productRepository, categoryRepository, brandRepository } = useRepository();
  const toast = useToast();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [idManuallyEdited, setIdManuallyEdited] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<{ index: number; message: string } | null>(null);

  useEffect(() => {
    categoryRepository.getAll().then(setCategories).catch(() => {});
    brandRepository.getAll().then(setBrands).catch(() => {});
    if (isEdit && id) {
      productRepository
        .getById(id)
        .then((product) => {
          if (product) {
            setForm({
              productId: id,
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
            setIdManuallyEdited(true);
          } else {
            setError('Product not found');
          }
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Failed to load product')
        )
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, productRepository, categoryRepository, brandRepository]);

  const handleField = (
    field: keyof FormData,
    value: string | boolean | string[]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !slugManuallyEdited) {
        next.slug = toSlug(String(value));
      }
      if (!idManuallyEdited && !isEdit) {
        const brand = field === 'brand' ? String(value) : prev.brand;
        const category = field === 'category' ? String(value) : prev.category;
        const name = field === 'name' ? String(value) : prev.name;
        if (brand && category && name) {
          next.productId = generateProductId(brand, category, name);
        }
      }
      return next;
    });
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

  const handleImageUpload = (
    index: number,
    file: File,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setUploadError({
        index,
        message: `Image exceeds the ${MAX_IMAGE_SIZE_MB}MB limit`,
      });
      event.target.value = '';
      return;
    }
    setUploadingIndex(index);
    setUploadError(null);
    ImageKitService.uploadProductImage({
      file,
      category: form.category,
      slug: form.slug || toSlug(form.name),
    })
      .then((url) => {
        const updated = [...form.images];
        updated[index] = url;
        handleField('images', updated);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setUploadError({ index, message });
        toast.error('Upload gambar gagal: ' + message);
      })
      .finally(() => {
        setUploadingIndex(null);
        event.target.value = '';
      });
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
      id: form.productId.trim() || undefined,
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
        toast.success('Produk berhasil diperbarui');
      } else {
        await productRepository.create(payload);
        toast.success('Produk berhasil dibuat');
      }
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan produk');
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
              <Label htmlFor="productId">Product ID</Label>
              <input
                id="productId"
                type="text"
                value={form.productId}
                onChange={(e) => {
                  setIdManuallyEdited(true);
                  handleField('productId', e.target.value);
                }}
                placeholder={!idManuallyEdited && form.brand && form.category && form.name ? generateProductId(form.brand, form.category, form.name) : 'Auto-generated'}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-ink-muted">
                Leave empty to auto-generate from brand, category, and name.
              </p>
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
              <select
                id="brand"
                required
                value={form.brand}
                onChange={(e) => handleField('brand', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
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
              disabled={uploadingIndex !== null}
              className="text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50"
            >
              + Add Image
            </button>
          </div>
          <p className="text-xs text-ink-muted">
            Upload via ImageKit (max {MAX_IMAGE_SIZE_MB}MB each). First image is
            the primary. Drag via buttons to reorder.
          </p>

          {form.images.map((key, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-xs font-mono text-ink-muted w-6 text-right shrink-0 pt-1">
                {index === 0 ? '\u2605' : index}
              </span>
              <div className="w-16 h-16 rounded-lg border border-border bg-surface-hover overflow-hidden shrink-0 flex items-center justify-center">
                {key ? (
                  <img
                    src={ImageService.getThumbnailUrl(key)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-ink-muted text-lg">+</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(index, file, e);
                  }}
                  disabled={uploadingIndex !== null}
                  className="block w-full text-xs text-ink-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-surface-hover file:text-sm file:font-medium file:text-ink-secondary file:cursor-pointer hover:file:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {key ? (
                  <p
                    className="mt-1 text-xs font-mono text-ink-muted truncate"
                    title={key}
                  >
                    {key}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-ink-muted">
                    Choose a file to upload
                  </p>
                )}
                {uploadingIndex === index && (
                  <p className="mt-1 text-xs text-primary">Uploading...</p>
                )}
                {uploadError?.index === index && (
                  <p className="mt-1 text-xs text-red-600">
                    {uploadError.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 pt-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveImage(index, 'up')}
                  disabled={index === 0 || uploadingIndex !== null}
                  className="p-2 text-ink-muted hover:text-ink-secondary disabled:opacity-30"
                  title="Move up"
                >
                  {'\u2191'}
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 'down')}
                  disabled={index === form.images.length - 1 || uploadingIndex !== null}
                  className="p-2 text-ink-muted hover:text-ink-secondary disabled:opacity-30"
                  title="Move down"
                >
                  {'\u2193'}
                </button>
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    disabled={uploadingIndex !== null}
                    className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30"
                    title="Remove"
                  >
                    {'\u00d7'}
                  </button>
                )}
              </div>
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

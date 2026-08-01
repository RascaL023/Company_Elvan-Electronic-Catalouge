import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useProduct';
import { formatPrice } from '../../utils/formatters';
import { getCategoryName } from '../../utils/categories';
import { Rating } from '../../components/ui/Rating';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { ImageService } from '../../services/imageService';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id!);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-1/2 aspect-square rounded-2xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!product) {
    return (
      <ErrorState
        message="Product not found"
        onRetry={() => window.location.reload()}
      />
    );
  }

  const primaryImageUrl = ImageService.getDetailUrl(product.images[0] || '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-ink-muted mb-6 animate-fade-in">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-1/2 bg-surface-alt rounded-2xl p-8 lg:p-12 flex items-center justify-center overflow-hidden animate-scale-in">
          <img
            src={primaryImageUrl}
            alt={product.name}
            className="w-full max-w-md h-auto object-contain text-sm text-ink-muted text-center"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <span className="text-xs font-medium text-ink-secondary bg-surface-hover px-2 py-1 rounded-full self-start uppercase tracking-wide">
            {getCategoryName(product.category)}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-ink leading-tight">
            {product.name}
          </h1>
          <Rating rate={product.rating.rate} count={product.rating.count} />
          <p className="text-ink-secondary leading-relaxed">
            {product.description}
          </p>
          <div className="border-t border-border pt-6 mt-2">
            <div className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

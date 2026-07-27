import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import { Rating } from '../../components/ui/Rating';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id!);
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = product
    ? items.find((i) => i.product.id === product.id)
    : null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600 transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.title}</span>
      </nav>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-1/2 bg-gray-50 rounded-2xl p-8 lg:p-12 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full max-w-md h-auto object-contain"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full self-start uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
            {product.title}
          </h1>
          <Rating rate={product.rating.rate} count={product.rating.count} />
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>
          <div className="border-t border-gray-100 pt-6 mt-2">
            <div className="text-4xl font-bold text-indigo-600 mb-6">
              {formatPrice(product.price)}
            </div>
            <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto">
              {added
                ? 'Added!'
                : cartItem
                  ? `Add Again (${cartItem.quantity} in cart)`
                  : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

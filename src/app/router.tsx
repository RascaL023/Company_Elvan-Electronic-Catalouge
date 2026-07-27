import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { ProductsPage } from '../features/products/ProductsPage';
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage';
import { CartPage } from '../features/cart/CartPage';
import { NotFoundPage } from '../features/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: '/', element: <ProductsPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

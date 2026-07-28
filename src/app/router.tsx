import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { ProductsPage } from '../features/products/ProductsPage';
import { ProductDetailPage } from '../features/product-detail/ProductDetailPage';
import { NotFoundPage } from '../features/NotFoundPage';
import {
  AdminLayout,
  AdminDashboard,
  ProductForm,
} from '../features/admin';

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: '/', element: <ProductsPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/products/new', element: <ProductForm /> },
      { path: '/admin/products/:id/edit', element: <ProductForm /> },
    ],
  },
]);

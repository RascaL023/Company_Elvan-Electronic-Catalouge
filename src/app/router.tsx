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
import { LoginPage } from '../features/auth';

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
    path: '/admin/login',
    element: <LoginPage />,
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

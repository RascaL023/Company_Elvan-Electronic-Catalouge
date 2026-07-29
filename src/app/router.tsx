import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { ProductsPage } from '../features/products/ProductsPage';
import { NotFoundPage } from '../features/NotFoundPage';

const ProductDetailPage = lazy(() =>
  import('../features/product-detail/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  }))
);

const AdminLayout = lazy(() =>
  import('../features/admin/AdminLayout').then((m) => ({
    default: m.AdminLayout,
  }))
);

const AdminDashboard = lazy(() =>
  import('../features/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);

const ProductForm = lazy(() =>
  import('../features/admin/ProductForm').then((m) => ({
    default: m.ProductForm,
  }))
);

const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: '/', element: <ProductsPage /> },
      {
        path: '/product/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      {
        path: '/admin',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: '/admin/products/new',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductForm />
          </Suspense>
        ),
      },
      {
        path: '/admin/products/:id/edit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProductForm />
          </Suspense>
        ),
      },
    ],
  },
]);
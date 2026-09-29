import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { ProductsPage } from '../features/products/ProductsPage';
import { NotFoundPage } from '../features/NotFoundPage';
import { lazyWithReload } from './lazyWithReload';
import { RouteErrorElement } from './RouteErrorElement';

const ProductDetailPage = lazyWithReload(() =>
  import('../features/product-detail/ProductDetailPage').then((m) => ({
    default: m.ProductDetailPage,
  }))
);

const AdminArea = lazyWithReload(() =>
  import('./AdminArea').then((m) => ({
    default: m.AdminArea,
  }))
);

const AdminLayout = lazyWithReload(() =>
  import('../features/admin/AdminLayout').then((m) => ({
    default: m.AdminLayout,
  }))
);

const AdminDashboard = lazyWithReload(() =>
  import('../features/admin/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);

const ProductForm = lazyWithReload(() =>
  import('../features/admin/ProductForm').then((m) => ({
    default: m.ProductForm,
  }))
);

const AdminCategoryList = lazyWithReload(() =>
  import('../features/admin/AdminCategoryList').then((m) => ({
    default: m.AdminCategoryList,
  }))
);

const CategoryForm = lazyWithReload(() =>
  import('../features/admin/CategoryForm').then((m) => ({
    default: m.CategoryForm,
  }))
);

const AdminBrandList = lazyWithReload(() =>
  import('../features/admin/AdminBrandList').then((m) => ({
    default: m.AdminBrandList,
  }))
);

const BrandForm = lazyWithReload(() =>
  import('../features/admin/BrandForm').then((m) => ({
    default: m.BrandForm,
  }))
);

const LoginPage = lazyWithReload(() =>
  import('../features/auth/LoginPage').then((m) => ({
    default: m.LoginPage,
  }))
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    errorElement: <RouteErrorElement />,
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
    path: '/admin',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AdminArea />
      </Suspense>
    ),
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: 'login',
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
            index: true,
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'products/new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProductForm />
              </Suspense>
            ),
          },
          {
            path: 'products/:id/edit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <ProductForm />
              </Suspense>
            ),
          },
          {
            path: 'categories',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminCategoryList />
              </Suspense>
            ),
          },
          {
            path: 'categories/new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <CategoryForm />
              </Suspense>
            ),
          },
          {
            path: 'categories/:id/edit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <CategoryForm />
              </Suspense>
            ),
          },
          {
            path: 'brands',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AdminBrandList />
              </Suspense>
            ),
          },
          {
            path: 'brands/new',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BrandForm />
              </Suspense>
            ),
          },
          {
            path: 'brands/:id/edit',
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <BrandForm />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

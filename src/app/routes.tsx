import { Navigate, type RouteObject } from 'react-router';
import { AdminLayout } from '@/features/admin/ui/AdminLayout';
import { AdminOrdersPage } from '@/features/admin/ui/AdminOrdersPage';
import { AdminProductsPage } from '@/features/admin/ui/AdminProductsPage';
import { LoginPage } from '@/features/auth/ui/LoginPage';
import { RegisterPage } from '@/features/auth/ui/RegisterPage';
import { RequireAuth } from '@/features/auth/ui/RequireAuth';
import { CartPage } from '@/features/cart/ui/CartPage';
import { CatalogPage } from '@/features/catalog/ui/CatalogPage';
import { ProductDetailPage } from '@/features/catalog/ui/ProductDetailPage';
import { CheckoutPage } from '@/features/checkout/ui/CheckoutPage';
import { OrdersPage } from '@/features/orders/ui/OrdersPage';
import { RootLayout } from './layout/RootLayout';
import { NotFoundPage } from './NotFoundPage';

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrdersPage /> },
        ],
      },
      {
        path: 'admin',
        element: <RequireAuth role="admin" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="products" replace /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

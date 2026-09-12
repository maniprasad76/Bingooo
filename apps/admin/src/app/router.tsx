import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminGuard } from '../components/AdminGuard';
import { AdminLayout } from '../components/AdminLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CouponsPage } from '../pages/CouponsPage';
import { BannersPage } from '../pages/BannersPage';
import { SettingsPage } from '../pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'banners', element: <BannersPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { RouteFallback } from '../components/common/RouteFallback';
import { lazyPage } from './lazyPage';

// ─── Lazy-loaded route components (code-splitting for faster first paint) ───
const DashboardOverviewPage = lazyPage(() => import('../pages/DashboardOverviewPage'), 'DashboardOverviewPage');
const ProductsPage = lazyPage(() => import('../pages/ProductsPage'), 'ProductsPage');
const ProductEditorPage = lazyPage(() => import('../pages/ProductEditorPage'), 'ProductEditorPage');
const InventoryPage = lazyPage(() => import('../pages/InventoryPage'), 'InventoryPage');
const OrdersPage = lazyPage(() => import('../pages/OrdersPage'), 'OrdersPage');
const OrderDetailPage = lazyPage(() => import('../pages/OrderDetailPage'), 'OrderDetailPage');
const CustomPrintQueuePage = lazyPage(() => import('../pages/CustomPrintQueuePage'), 'CustomPrintQueuePage');
const CustomRequirementsPage = lazyPage(() => import('../pages/CustomRequirementsPage'), 'CustomRequirementsPage');
const CategoriesPage = lazyPage(() => import('../pages/CategoriesPage'), 'CategoriesPage');
const CouponsPage = lazyPage(() => import('../pages/CouponsPage'), 'CouponsPage');
const DiscountsPage = lazyPage(() => import('../pages/DiscountsPage'), 'DiscountsPage');
const BannersPage = lazyPage(() => import('../pages/BannersPage'), 'BannersPage');
const PaymentsPage = lazyPage(() => import('../pages/PaymentsPage'), 'PaymentsPage');
const ReturnsPage = lazyPage(() => import('../pages/ReturnsPage'), 'ReturnsPage');
const UploadsPage = lazyPage(() => import('../pages/UploadsPage'), 'UploadsPage');
const CustomersPage = lazyPage(() => import('../pages/CustomersPage'), 'CustomersPage');
const CustomerDetailPage = lazyPage(() => import('../pages/CustomerDetailPage'), 'CustomerDetailPage');
const StaffUsersPage = lazyPage(() => import('../pages/StaffUsersPage'), 'StaffUsersPage');
const RolesPermissionsPage = lazyPage(() => import('../pages/RolesPermissionsPage'), 'RolesPermissionsPage');
const ReviewsPage = lazyPage(() => import('../pages/ReviewsPage'), 'ReviewsPage');
const NotificationsPage = lazyPage(() => import('../pages/NotificationsPage'), 'NotificationsPage');
const AnalyticsPage = lazyPage(() => import('../pages/AnalyticsPage'), 'AnalyticsPage');
const AuditLogsPage = lazyPage(() => import('../pages/AuditLogsPage'), 'AuditLogsPage');
const SettingsPage = lazyPage(() => import('../pages/SettingsPage'), 'SettingsPage');
const ProfilePage = lazyPage(() => import('../pages/ProfilePage'), 'ProfilePage');
const LoginPage = lazyPage(() => import('../pages/LoginPage'), 'LoginPage');

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },

      // Catalog
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductEditorPage /> },
      { path: 'products/:id/edit', element: <ProductEditorPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'inventory', element: <InventoryPage /> },

      // Orders & Studio
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'custom-orders', element: <CustomPrintQueuePage /> },
      { path: 'custom-requirements', element: <CustomRequirementsPage /> },
      { path: 'returns', element: <ReturnsPage /> },

      // Marketing
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'discounts', element: <DiscountsPage /> },
      { path: 'banners', element: <BannersPage /> },

      // Finance & Media
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'uploads', element: <UploadsPage /> },

      // Customers & Access
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'users', element: <StaffUsersPage /> },
      { path: 'roles', element: <RolesPermissionsPage /> },

      // System
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <ProfilePage /> },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

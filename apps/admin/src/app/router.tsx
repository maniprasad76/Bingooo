import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardOverviewPage } from '../pages/DashboardOverviewPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductEditorPage } from '../pages/ProductEditorPage';
import { InventoryPage } from '../pages/InventoryPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { CustomPrintQueuePage } from '../pages/CustomPrintQueuePage';
import { CustomRequirementsPage } from '../pages/CustomRequirementsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CouponsPage } from '../pages/CouponsPage';
import { DiscountsPage } from '../pages/DiscountsPage';
import { BannersPage } from '../pages/BannersPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { ReturnsPage } from '../pages/ReturnsPage';
import { UploadsPage } from '../pages/UploadsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { CustomerDetailPage } from '../pages/CustomerDetailPage';
import { StaffUsersPage } from '../pages/StaffUsersPage';
import { RolesPermissionsPage } from '../pages/RolesPermissionsPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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

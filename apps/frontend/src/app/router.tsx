import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { RequireAuth } from '../components/common/RequireAuth';
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { lazyPage } from './lazyPage';

// ─── Lazy-loaded route components (code-splitting for faster first paint) ───
const ShopPage = lazyPage(() => import('../pages/ShopPage'), 'ShopPage');
const ProductPage = lazyPage(() => import('../pages/ProductPage'), 'ProductPage');
const CustomizerPage = lazyPage(() => import('../pages/CustomizerPage'), 'CustomizerPage');
const CartPage = lazyPage(() => import('../pages/CartPage'), 'CartPage');
const CheckoutPage = lazyPage(() => import('../pages/CheckoutPage'), 'CheckoutPage');
const OrderSuccessPage = lazyPage(() => import('../pages/OrderSuccessPage'), 'OrderSuccessPage');
const AccountPage = lazyPage(() => import('../pages/AccountPage'), 'AccountPage');
const OrdersPage = lazyPage(() => import('../pages/OrdersPage'), 'OrdersPage');
const OrderDetailPage = lazyPage(() => import('../pages/OrderDetailPage'), 'OrderDetailPage');
const WishlistPage = lazyPage(() => import('../pages/WishlistPage'), 'WishlistPage');
const SavedDesignsPage = lazyPage(() => import('../pages/SavedDesignsPage'), 'SavedDesignsPage');
const AddressesPage = lazyPage(() => import('../pages/AddressesPage'), 'AddressesPage');
const AdminDashboardPage = lazyPage(() => import('../pages/AdminDashboardPage'), 'AdminDashboardPage');
const PoliciesPage = lazyPage(() => import('../pages/PoliciesPage'), 'PoliciesPage');
const ContactPage = lazyPage(() => import('../pages/ContactPage'), 'ContactPage');
const AboutPage = lazyPage(() => import('../pages/AboutPage'), 'AboutPage');
const FaqPage = lazyPage(() => import('../pages/FaqPage'), 'FaqPage');
const PrivacyPolicyPage = lazyPage(() => import('../pages/PrivacyPolicyPage'), 'PrivacyPolicyPage');
const TermsPage = lazyPage(() => import('../pages/TermsPage'), 'TermsPage');
const ShippingPolicyPage = lazyPage(() => import('../pages/ShippingPolicyPage'), 'ShippingPolicyPage');
const ReturnsRefundsPage = lazyPage(() => import('../pages/ReturnsRefundsPage'), 'ReturnsRefundsPage');
const CancellationPolicyPage = lazyPage(() => import('../pages/CancellationPolicyPage'), 'CancellationPolicyPage');
const SizeGuidePage = lazyPage(() => import('../pages/SizeGuidePage'), 'SizeGuidePage');
const EmptyStatePage = lazyPage(() => import('../pages/EmptyStatePage'), 'EmptyStatePage');
const RecentlyViewedPage = lazyPage(() => import('../pages/RecentlyViewedPage'), 'RecentlyViewedPage');
const TrackOrderPage = lazyPage(() => import('../pages/TrackOrderPage'), 'TrackOrderPage');
const DtfPrintingPage = lazyPage(() => import('../pages/DtfPrintingPage'), 'DtfPrintingPage');
const BulkOrdersPage = lazyPage(() => import('../pages/BulkOrdersPage'), 'BulkOrdersPage');
const FabricGuidePage = lazyPage(() => import('../pages/FabricGuidePage'), 'FabricGuidePage');
const ArtworkGuidelinesPage = lazyPage(() => import('../pages/ArtworkGuidelinesPage'), 'ArtworkGuidelinesPage');
const NotFoundPage = lazyPage(() => import('../pages/NotFoundPage'), 'NotFoundPage');

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'about-us', element: <AboutPage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'category/:slug', element: <ShopPage /> },
      { path: 'collection/:slug', element: <ShopPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'customize', element: <CustomizerPage /> },
      { path: 'customize/:productSlug', element: <CustomizerPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      { path: 'order-success/:orderNumber', element: <OrderSuccessPage /> },
      { path: 'payment/success', element: <OrderSuccessPage /> },
      { path: 'payment/failure', element: <OrderSuccessPage /> },
      { path: 'search', element: <ShopPage /> },
      { path: 'recently-viewed', element: <RecentlyViewedPage /> },
      { path: 'account', element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: 'account/orders', element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: 'account/orders/:orderNumber', element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: 'account/wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
      { path: 'wishlist', element: <RequireAuth><WishlistPage /></RequireAuth> },
      { path: 'account/recently-viewed', element: <RecentlyViewedPage /> },
      { path: 'account/designs', element: <RequireAuth><SavedDesignsPage /></RequireAuth> },
      { path: 'account/addresses', element: <RequireAuth><AddressesPage /></RequireAuth> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'privacy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'terms-and-conditions', element: <TermsPage /> },
      { path: 'shipping-policy', element: <ShippingPolicyPage /> },
      { path: 'shipping', element: <ShippingPolicyPage /> },
      { path: 'returns-refunds', element: <ReturnsRefundsPage /> },
      { path: 'return-policy', element: <ReturnsRefundsPage /> },
      { path: 'returns', element: <ReturnsRefundsPage /> },
      { path: 'cancellation-policy', element: <CancellationPolicyPage /> },
      { path: 'size-guide', element: <SizeGuidePage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'track', element: <TrackOrderPage /> },
      { path: 'dtf-printing', element: <DtfPrintingPage /> },
      { path: 'bulk-orders', element: <BulkOrdersPage /> },
      { path: 'fabric-specifications', element: <FabricGuidePage /> },
      { path: 'fabric-guide', element: <FabricGuidePage /> },
      { path: 'artwork-guidelines', element: <ArtworkGuidelinesPage /> },
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'policies/:slug', element: <PoliciesPage /> },
      { path: 'empty', element: <EmptyStatePage /> },
      { path: 'empty-state', element: <EmptyStatePage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/*', element: <AdminDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

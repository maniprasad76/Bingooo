import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { RequireAuth } from '../components/common/RequireAuth';
import { RouteErrorBoundary } from '../components/common/RouteErrorBoundary';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
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
const AdminLoginPage = lazyPage(() => import('../pages/AdminLoginPage'), 'AdminLoginPage');
const SearchPage = lazyPage(() => import('../pages/SearchPage'), 'SearchPage');
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
const RecentlyViewedPage = lazyPage(() => import('../pages/RecentlyViewedPage'), 'RecentlyViewedPage');
const TrackOrderPage = lazyPage(() => import('../pages/TrackOrderPage'), 'TrackOrderPage');
const ArtworkGuidelinesPage = lazyPage(() => import('../pages/ArtworkGuidelinesPage'), 'ArtworkGuidelinesPage');
const NotFoundPage = lazyPage(() => import('../pages/NotFoundPage'), 'NotFoundPage');

// Helper redirect component for legacy/sub-policy slugs to resolve cannibalization and redirect chains
function PolicyRedirect() {
  const { slug } = useParams<{ slug: string }>();
  if (slug === 'size-guide') return <Navigate to="/size-guide" replace />;
  if (slug?.startsWith('shipping')) return <Navigate to="/shipping-policy" replace />;
  if (slug?.startsWith('return')) return <Navigate to="/returns-refunds" replace />;
  if (slug?.startsWith('privacy')) return <Navigate to="/privacy-policy" replace />;
  if (slug?.startsWith('terms')) return <Navigate to="/terms" replace />;
  if (slug?.startsWith('cancellation')) return <Navigate to="/cancellation-policy" replace />;
  return <Navigate to="/policies" replace />;
}

// Helper redirect component for collection slugs
function CollectionRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/shop?collection=${slug || ''}`} replace />;
}

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },

      // Brand Story
      { path: 'about', element: <AboutPage /> },
      { path: 'about-us', element: <Navigate to="/about" replace /> },

      // Catalog & Categories
      { path: 'shop', element: <ShopPage /> },
      { path: 'category/:slug', element: <ShopPage /> },
      { path: 'collection/:slug', element: <CollectionRedirect /> },
      { path: 'product/:slug', element: <ProductPage /> },

      // Custom Atelier
      { path: 'customize', element: <CustomizerPage /> },
      { path: 'customize/:productSlug', element: <CustomizerPage /> },
      { path: 'custom', element: <Navigate to="/customize" replace /> },

      // Shopping Bag & Checkout
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      { path: 'order-success/:orderNumber', element: <OrderSuccessPage /> },
      { path: 'payment/success', element: <OrderSuccessPage /> },
      { path: 'payment/failure', element: <OrderSuccessPage /> },

      // Search & Discovery
      { path: 'search', element: <SearchPage /> },
      { path: 'recently-viewed', element: <RecentlyViewedPage /> },

      // Wishlist
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'account/wishlist', element: <WishlistPage /> },

      // User Account (Protected)
      { path: 'account', element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: 'account/orders', element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: 'account/orders/:orderNumber', element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: 'account/recently-viewed', element: <RecentlyViewedPage /> },
      { path: 'account/designs', element: <RequireAuth><SavedDesignsPage /></RequireAuth> },
      { path: 'account/addresses', element: <RequireAuth><AddressesPage /></RequireAuth> },

      // Auth
      { path: 'login', element: <LoginPage /> },
      { path: 'signin', element: <Navigate to="/login" replace /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'register', element: <Navigate to="/signup" replace /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Customer Care & Direct Links
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'track-order', element: <TrackOrderPage /> },
      { path: 'track', element: <Navigate to="/track-order" replace /> },

      // Legal & Store Policies (Canonical paths + single-hop redirects)
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'policies/:slug', element: <PolicyRedirect /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'privacy', element: <Navigate to="/privacy-policy" replace /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'terms-and-conditions', element: <Navigate to="/terms" replace /> },
      { path: 'shipping-policy', element: <ShippingPolicyPage /> },
      { path: 'shipping', element: <Navigate to="/shipping-policy" replace /> },
      { path: 'returns-refunds', element: <ReturnsRefundsPage /> },
      { path: 'return-policy', element: <Navigate to="/returns-refunds" replace /> },
      { path: 'returns', element: <Navigate to="/returns-refunds" replace /> },
      { path: 'cancellation-policy', element: <CancellationPolicyPage /> },
      { path: 'cancellation', element: <Navigate to="/cancellation-policy" replace /> },
      { path: 'size-guide', element: <SizeGuidePage /> },

      // Services & Textile Engineering Guides
      { path: 'bulk-orders', element: <Navigate to="/contact" replace /> },
      { path: 'dtf-printing', element: <Navigate to="/customize" replace /> },
      { path: 'fabric-guide', element: <Navigate to="/about" replace /> },
      { path: 'fabric-specifications', element: <Navigate to="/about" replace /> },
      { path: 'artwork-guidelines', element: <ArtworkGuidelinesPage /> },

      // Redundant / Demo routes redirected to clean destinations
      { path: 'empty', element: <Navigate to="/" replace /> },
      { path: 'empty-state', element: <Navigate to="/" replace /> },

      // Admin Portal
      { path: 'admin/login', element: <AdminLoginPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/*', element: <AdminDashboardPage /> },

      // Catch-all 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

import { createBrowserRouter } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { ProductPage } from '../pages/ProductPage';
import { CustomizerPage } from '../pages/CustomizerPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { AccountPage } from '../pages/AccountPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { WishlistPage } from '../pages/WishlistPage';
import { SavedDesignsPage } from '../pages/SavedDesignsPage';
import { AddressesPage } from '../pages/AddressesPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { PoliciesPage } from '../pages/PoliciesPage';
import { ContactPage } from '../pages/ContactPage';
import { AboutPage } from '../pages/AboutPage';
import { FaqPage } from '../pages/FaqPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsPage } from '../pages/TermsPage';
import { ShippingPolicyPage } from '../pages/ShippingPolicyPage';
import { ReturnsRefundsPage } from '../pages/ReturnsRefundsPage';
import { CancellationPolicyPage } from '../pages/CancellationPolicyPage';
import { SizeGuidePage } from '../pages/SizeGuidePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PageLayout />,
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
      { path: 'payment/success', element: <OrderSuccessPage /> },
      { path: 'payment/failure', element: <OrderSuccessPage /> },
      { path: 'search', element: <ShopPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'account/orders', element: <OrdersPage /> },
      { path: 'account/orders/:orderNumber', element: <OrderDetailPage /> },
      { path: 'account/wishlist', element: <WishlistPage /> },
      { path: 'account/designs', element: <SavedDesignsPage /> },
      { path: 'account/addresses', element: <AddressesPage /> },
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
      { path: 'policies', element: <PoliciesPage /> },
      { path: 'policies/:slug', element: <PoliciesPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/*', element: <AdminDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export function PageLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0 min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
    </div>
  );
}

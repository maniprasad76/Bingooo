import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Heart,
  MapPin,
  User,
  Lock,
  CreditCard,
  Bell,
  RotateCcw,
  Star,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Shirt,
  Mail,
  Truck,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Account Dashboard', icon: Home, active: true },
  { id: 'orders', label: 'My Orders', icon: Package, href: '/account/orders' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
  { id: 'addresses', label: 'My Addresses', icon: MapPin, href: '/account/addresses' },
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
  { id: 'cards', label: 'Saved Cards', icon: CreditCard },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'reviews', label: 'My Reviews', icon: Star },
];

const RECENT_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: '#BG12456',
    title: 'Oversized Chaos Tee',
    variant: 'Black • L • Qty: 1',
    price: 799,
    date: '02 May, 2024',
    status: 'Delivered',
    statusColor: 'green',
    slug: 'chaos-printed-tee',
    image: '',
  },
  {
    id: 'ord-2',
    orderNumber: '#BG12410',
    title: 'Essential Hoodie',
    variant: 'Greige • M • Qty: 1',
    price: 1199,
    date: '28 Apr, 2024',
    status: 'Delivered',
    statusColor: 'green',
    slug: 'essential-hoodie',
    image: '',
  },
  {
    id: 'ord-3',
    orderNumber: '#BG12378',
    title: 'Baggy Fit Jeans',
    variant: 'Blue • 32 • Qty: 1',
    price: 1299,
    date: '20 Apr, 2024',
    status: 'Shipped',
    statusColor: 'amber',
    slug: 'baggy-fit-jeans',
    image: '',
  },
];

export function AccountPage() {
  const { logout } = useAuthStore();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleBuyAgain = (order: (typeof RECENT_ORDERS)[0]) => {
    addItem(order.id, 1);
    toast({
      title: `${order.title} added to bag!`,
      description: 'You can proceed to checkout from the cart.',
      variant: 'success',
    });
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out successfully', variant: 'info' });
    navigate('/');
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast({
      title: 'Subscribed to updates!',
      description: 'You will receive our latest drop alerts and exclusive offers.',
      variant: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#171717] min-h-screen">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* ─── Breadcrumbs ─── */}
        <nav className="flex items-center gap-2 text-xs font-sans text-[#6F6A63]">
          <Link to="/" className="hover:text-[#E6321C]">Home</Link>
          <span>&gt;</span>
          <span className="text-[#171717] font-medium">My Account</span>
        </nav>

        {/* ─── Header: MY ACCOUNT (Exact Image 3) ─── */}
        <div className="text-left pb-4 border-b border-[#DDD3C5]">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight">
            MY ACCOUNT
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6F6A63] font-sans">
            Manage your profile, orders and preferences
          </p>
        </div>

        {/* ─── Two-Column Layout (Sidebar + Content) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Navigation Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-3 shadow-xs space-y-0.5 text-left">
              {SIDEBAR_NAV.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;

                if (nav.href) {
                  return (
                    <Link
                      key={nav.id}
                      to={nav.href}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium text-[#171717] hover:bg-[#F7EEDB]/60 hover:text-[#E6321C] transition-colors"
                    >
                      <Icon size={16} className="text-[#6F6A63]" />
                      <span>{nav.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => setActiveTab(nav.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans transition-colors ${
                      isActive
                        ? 'bg-[#FDF0EE] text-[#E6321C] font-bold shadow-2xs'
                        : 'text-[#171717] hover:bg-[#F7EEDB]/60 hover:text-[#E6321C] font-medium'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#E6321C]' : 'text-[#6F6A63]'} />
                    <span>{nav.label}</span>
                  </button>
                );
              })}

              {/* Logout Button */}
              <div className="pt-2 border-t border-[#DDD3C5]/60 mt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold text-[#6F6A63] hover:text-[#E6321C] hover:bg-[#FDF0EE] transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* 1. Profile Overview Header Card (Exact Image 3) */}
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* User Info Left */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#F7EEDB] border border-[#DDD3C5] text-[#E6321C] font-heading font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
                  B
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-[#171717] flex items-center gap-1.5">
                    Hey, Basa Prasaduu <span>👋</span>
                  </h2>
                  <p className="text-xs text-[#6F6A63] font-sans mt-0.5">basaprasaduu@gmail.com</p>
                  <p className="text-xs text-[#6F6A63] font-sans mt-0.5">+91 79817 87317</p>
                  <button
                    type="button"
                    onClick={() => toast({ title: 'Profile editing modal', variant: 'info' })}
                    className="mt-3 px-3 py-1 rounded-lg border border-[#DDD3C5] hover:border-[#E6321C] text-[#E6321C] font-sans font-bold text-[10px] uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    EDIT PROFILE
                  </button>
                </div>
              </div>

              {/* Stats Counters Right (3 Columns) */}
              <div className="w-full md:w-auto grid grid-cols-3 gap-4 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#DDD3C5] md:pl-8 text-center sm:text-left">
                {/* Total Orders */}
                <div>
                  <ShoppingBag size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                  <span className="text-[11px] font-sans text-[#6F6A63] block">Total Orders</span>
                  <span className="font-heading font-black text-2xl text-[#E6321C] block">12</span>
                  <Link
                    to="/account/orders"
                    className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5"
                  >
                    View all orders
                  </Link>
                </div>

                {/* Wishlist Items */}
                <div>
                  <Heart size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                  <span className="text-[11px] font-sans text-[#6F6A63] block">Wishlist Items</span>
                  <span className="font-heading font-black text-2xl text-[#E6321C] block">8</span>
                  <Link
                    to="/account/wishlist"
                    className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5"
                  >
                    View wishlist
                  </Link>
                </div>

                {/* Addresses */}
                <div>
                  <MapPin size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                  <span className="text-[11px] font-sans text-[#6F6A63] block">Addresses</span>
                  <span className="font-heading font-black text-2xl text-[#E6321C] block">2</span>
                  <Link
                    to="/account/addresses"
                    className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5"
                  >
                    Manage addresses
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Recent Orders Card (Exact Image 3) */}
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                <h3 className="font-heading font-bold text-base text-[#171717]">
                  Recent Orders
                </h3>
                <Link
                  to="/account/orders"
                  className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[#E6321C] hover:text-[#B91F12] transition-colors"
                >
                  <span>View All Orders</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Order Rows */}
              <div className="divide-y divide-[#DDD3C5]/60">
                {RECENT_ORDERS.map((ord) => (
                  <div
                    key={ord.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-center gap-3.5">
                      <div className="h-16 w-16 rounded-xl bg-[#F7EEDB]/60 border border-[#DDD3C5] flex items-center justify-center shrink-0">
                        <Shirt size={28} className="text-[#171717]/40" />
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#171717]">{ord.title}</h4>
                        <p className="text-xs text-[#6F6A63] font-sans mt-0.5">{ord.variant}</p>
                        <p className="font-sans font-bold text-sm text-[#171717] mt-1">₹{ord.price}</p>
                        <span className="text-[11px] text-[#6F6A63] font-sans block mt-0.5">
                          Order ID: {ord.orderNumber}
                        </span>
                      </div>
                    </div>

                    {/* Right: Date, Status, Link & Action Button */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                      <div className="text-right">
                        <span className="text-xs text-[#6F6A63] font-sans block">{ord.date}</span>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                            ord.statusColor === 'green'
                              ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                              : 'bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/account/orders/${ord.orderNumber.replace('#', '')}`}
                          className="text-xs font-sans font-semibold text-[#E6321C] hover:underline"
                        >
                          View Details →
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleBuyAgain(ord)}
                          className="px-4 py-1.5 rounded-lg border border-[#DDD3C5] hover:border-[#E6321C] text-[#E6321C] hover:bg-[#FDF0EE] text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs"
                        >
                          BUY AGAIN
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Quick Actions (Exact Image 3) */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-base text-[#171717]">
                Quick Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* My Addresses */}
                <Link
                  to="/account/addresses"
                  className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left"
                >
                  <MapPin size={20} className="text-[#E6321C] mb-2" />
                  <h4 className="font-sans font-bold text-xs text-[#171717]">My Addresses</h4>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    Manage saved addresses
                  </p>
                </Link>

                {/* Payment Methods */}
                <button
                  type="button"
                  onClick={() => toast({ title: 'Payment methods modal', variant: 'info' })}
                  className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left"
                >
                  <CreditCard size={20} className="text-[#E6321C] mb-2" />
                  <h4 className="font-sans font-bold text-xs text-[#171717]">Payment Methods</h4>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    Manage payment options
                  </p>
                </button>

                {/* Returns & Refunds */}
                <button
                  type="button"
                  onClick={() => toast({ title: 'Track returns & refunds', variant: 'info' })}
                  className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left"
                >
                  <RotateCcw size={20} className="text-[#E6321C] mb-2" />
                  <h4 className="font-sans font-bold text-xs text-[#171717]">Returns & Refunds</h4>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    Track returns & refunds
                  </p>
                </button>

                {/* My Reviews */}
                <button
                  type="button"
                  onClick={() => toast({ title: 'Your product reviews', variant: 'info' })}
                  className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left"
                >
                  <Star size={20} className="text-[#E6321C] mb-2" />
                  <h4 className="font-sans font-bold text-xs text-[#171717]">My Reviews</h4>
                  <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">
                    View your reviews
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stay in the loop! Newsletter Strip (Exact Image 3) ─── */}
        <div className="rounded-2xl border border-[#DDD3C5] bg-[#F7EEDB] p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#E6321C] shrink-0 shadow-xs">
              <Mail size={22} className="stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#171717]">
                Stay in the loop!
              </h3>
              <p className="text-xs text-[#6F6A63] font-sans mt-0.5">
                Get exclusive offers, new drops & style inspiration.
              </p>
            </div>
          </div>

          <form onSubmit={handleNewsletter} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 sm:w-72 h-11 rounded-xl border border-[#DDD3C5] bg-white px-3.5 text-xs font-sans text-[#171717] placeholder:text-[#6F6A63] focus:border-[#E6321C] focus:outline-none"
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#E6321C] hover:bg-[#B91F12] text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>

        {/* ─── Bottom Trust Strip (Exact Image 3) ─── */}
        <div className="pt-8 border-t border-[#DDD3C5] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Truck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Free Shipping</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">On orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Secure Payment</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">100% safe & secure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Easy Returns</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">7 days easy return</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Headphones size={26} className="text-[#E6321C] shrink-0 stroke-[1.6]" />
            <div>
              <div className="font-heading font-bold text-xs uppercase text-[#171717]">Customer Support</div>
              <div className="text-[11px] text-[#6F6A63] font-sans">We're here to help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

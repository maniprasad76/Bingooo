import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api/client';
import {
  Home,
  Package,
  Heart,
  MapPin,
  User,
  Lock,
  RotateCcw,
  Star,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Shirt,
  Mail,
  Plus,
  Trash2,
  X,
  Eye,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRecentlyViewedStore } from '../store/recentlyViewed';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Overview Dashboard', icon: Home },
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist Vault', icon: Heart, href: '/account/wishlist' },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Eye, href: '/recently-viewed' },
  { id: 'password', label: 'Security & Password', icon: Lock },
  { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'reviews', label: 'Garment Reviews', icon: Star },
];

export function AccountPage() {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const { user: authUser, logout, setUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Determine active tab from URL or query parameter
  const initialTab =
    location.pathname.includes('/profile') || searchParams.get('tab') === 'profile'
      ? 'profile'
      : location.pathname.includes('/orders') || searchParams.get('tab') === 'orders'
      ? 'orders'
      : 'dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const recentCount = useRecentlyViewedStore((s) => s.items.length);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Forms state
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    isDefault: false,
  });
  const [returnForm, setReturnForm] = useState({
    orderNumber: '',
    garmentTitle: '',
    size: 'M',
    reason: 'size_fit' as 'size_fit' | 'print_defect' | 'wrong_item' | 'fabric_feel',
    comments: '',
  });

  // Sizing preference state (Atelier touch)
  const [preferredFit, setPreferredFit] = useState('heavyweight_boxy');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<any>('/users/profile'),
  });

  const { data: userOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => api.get<any[]>('/orders'),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<any[]>('/wishlist'),
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<any[]>('/users/addresses'),
  });

  const { data: userReturns = [] } = useQuery({
    queryKey: ['user-returns'],
    queryFn: () => api.get<any[]>('/returns/my'),
  });

  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-reviews'],
    queryFn: () => api.get<any[]>('/reviews/my'),
  });

  const displayName = profile?.full_name || profile?.fullName || authUser?.fullName || 'Aditi Sharma';
  const displayEmail = profile?.email || authUser?.email || 'customer@bingooo.in';
  const displayPhone = profile?.phone || authUser?.phone || '+91 98765 43210';

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string; phone: string }) => api.patch<any>('/users/profile', data),
    onSuccess: (updated: any) => {
      queryClient.setQueryData(['profile'], updated);
      setUser(updated);
      toast({ title: 'Profile Updated', description: 'Your personal details have been saved.', variant: 'success' });
      setIsEditProfileOpen(false);
    },
    onError: (err: any) => {
      toast({ title: 'Update failed', description: err.message || 'Could not update profile', variant: 'danger' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', data),
    onSuccess: () => {
      toast({ title: 'Password Changed', description: 'Your password was successfully updated.', variant: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err: any) => {
      toast({ title: 'Password change failed', description: err.message || 'Current password incorrect', variant: 'danger' });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: any) => api.post('/users/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: 'Address Added', description: 'New shipping destination saved.', variant: 'success' });
      setIsAddAddressOpen(false);
      setNewAddressForm({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'IN',
        isDefault: false,
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast({ title: 'Address Deleted', variant: 'default' });
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: (data: any) => api.post('/returns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-returns'] });
      toast({ title: 'Return Request Logged', description: 'Our logistics team will verify pickup.', variant: 'success' });
      setIsReturnModalOpen(false);
      setReturnForm({
        orderNumber: '',
        garmentTitle: '',
        size: 'M',
        reason: 'size_fit',
        comments: '',
      });
    },
    onError: (err: any) => {
      toast({ title: 'Could not submit return', description: err.message, variant: 'danger' });
    },
  });

  const handleLogout = () => {
    triggerHaptic('light');
    logout();
    toast({ title: 'Logged out successfully', variant: 'info' });
    navigate('/');
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast({
      title: 'Subscribed to updates!',
      description: 'You will receive our latest drop alerts and atelier releases.',
      variant: 'success',
    });
    setNewsletterEmail('');
  };

  return (
    <main className="w-full bg-[#F7EEDB] text-[#171717] min-h-screen font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      <SEO
        title="Patron Profile & Account — BINGOOO Atelier"
        description="Manage your Bingooo profile, view order history, track deliveries, edit shipping addresses, and review saved garment archives."
        noindex={true}
      />

      {/* =======================================================
           TOP BREADCRUMB & PATRON MEMBERSHIP BAR
      ======================================================= */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/60 px-4 sm:px-8 py-3 text-[11px]">
        <div className="container-bingooo flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono uppercase tracking-wider text-[#6F6A63]">
            <Link to="/" className="hover:text-[#171717] transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#6F6A63]">PATRON PORTAL</span>
            <span>/</span>
            <span className="text-[#171717] font-bold">MY ACCOUNT & PROFILE</span>
          </nav>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#171717] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#238636] animate-pulse" />
            <span>ATELIER MEMBERSHIP ACTIVE • 7-DAY EXCHANGE PRIVILEGES</span>
          </div>
        </div>
      </div>

      <div className="container-bingooo py-8 sm:py-12 space-y-8">
        {/* =======================================================
             ATELIER PROFILE HERO / PATRON BADGE CARD
        ======================================================= */}
        <div className="border border-[#DDD3C5] bg-white rounded-[2px] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Square Monogram Avatar */}
            <div className="w-20 h-20 rounded-[2px] bg-[#171717] text-[#F7EEDB] font-mono text-3xl font-extrabold flex items-center justify-center border border-[#171717] shrink-0 shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-[#EDE0CC] border border-[#DDD3C5] font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-2 rounded-[2px]">
                <Sparkles className="w-3 h-3 text-[#E6321C]" />
                <span>ATELIER PATRON • VERIFIED ACCOUNT</span>
              </div>

              <h1 className="font-extrabold text-2xl sm:text-3xl text-[#171717] uppercase tracking-tight leading-none mb-2">
                {displayName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6F6A63] font-mono">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#171717]" />
                  <span>{displayEmail}</span>
                  <CheckCircle2 className="w-3 h-3 text-[#238636]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#171717]" />
                  <span>{displayPhone}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm({ fullName: displayName, phone: displayPhone });
                    setIsEditProfileOpen(true);
                  }}
                  className="btn btn-black text-[10px] h-9 px-4 rounded-[2px] inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>EDIT PROFILE DETAILS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className="btn btn-outline text-[10px] h-9 px-4 rounded-[2px] inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3" />
                  <span>MANAGE ADDRESSES</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Border Strip */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#DDD3C5] lg:pl-8 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-[#6F6A63] mb-1">
                <ShoppingBag className="w-4 h-4 text-[#171717]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">ORDERS</span>
              </div>
              <span className="font-mono font-extrabold text-2xl text-[#171717] block leading-none">{userOrders.length}</span>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-[10px] font-mono font-bold text-[#E6321C] hover:underline block mt-1.5"
              >
                VIEW ARCHIVE →
              </button>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[#6F6A63] mb-1">
                <Heart className="w-4 h-4 text-[#E6321C]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">WISHLIST</span>
              </div>
              <span className="font-mono font-extrabold text-2xl text-[#E6321C] block leading-none">{wishlist.length}</span>
              <Link to="/account/wishlist" className="text-[10px] font-mono font-bold text-[#171717] hover:underline block mt-1.5">
                SAVED PIECES →
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[#6F6A63] mb-1">
                <Eye className="w-4 h-4 text-[#171717]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">RECENT</span>
              </div>
              <span className="font-mono font-extrabold text-2xl text-[#171717] block leading-none">{recentCount}</span>
              <Link to="/recently-viewed" className="text-[10px] font-mono font-bold text-[#171717] hover:underline block mt-1.5">
                HISTORY →
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[#6F6A63] mb-1">
                <MapPin className="w-4 h-4 text-[#171717]" />
                <span className="font-mono text-[9px] uppercase tracking-wider">ADDRESSES</span>
              </div>
              <span className="font-mono font-extrabold text-2xl text-[#171717] block leading-none">{addresses.length}</span>
              <button onClick={() => setActiveTab('addresses')} className="text-[10px] font-mono font-bold text-[#171717] hover:underline block mt-1.5">
                DESTINATIONS →
              </button>
            </div>
          </div>
        </div>

        {/* =======================================================
             TWO-COLUMN WORKSPACE: SIDEBAR + ACTIVE TAB
        ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="border border-[#DDD3C5] bg-white p-2 sm:p-3 rounded-[2px] shadow-xs flex lg:flex-col overflow-x-auto sm:overflow-visible gap-1 text-left no-scrollbar">
              <div className="hidden lg:block px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#6F6A63] border-b border-[#DDD3C5]/60 mb-1">
                NAVIGATION DESK
              </div>

              {SIDEBAR_NAV.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;

                if (nav.href) {
                  return (
                    <Link
                      key={nav.id}
                      to={nav.href}
                      onClick={() => triggerHaptic('light')}
                      className="flex items-center justify-between px-3 sm:px-3.5 py-2.5 rounded-[2px] text-xs font-mono font-medium text-[#171717] hover:bg-[#F7EEDB] hover:text-[#E6321C] transition-colors shrink-0 whitespace-nowrap"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} className="text-[#6F6A63] shrink-0" />
                        <span>{nav.label}</span>
                      </span>
                      <ExternalLink size={11} className="text-[#6F6A63] hidden lg:block opacity-60" />
                    </Link>
                  );
                }

                return (
                  <button
                    key={nav.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab(nav.id);
                    }}
                    className={`flex items-center justify-between px-3 sm:px-3.5 py-2.5 rounded-[2px] text-xs font-mono transition-all shrink-0 whitespace-nowrap lg:w-full ${
                      isActive
                        ? 'bg-[#171717] text-white font-bold'
                        : 'text-[#171717] hover:bg-[#F7EEDB] hover:text-[#E6321C] font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon size={15} className={isActive ? 'text-[#E6321C] shrink-0' : 'text-[#6F6A63] shrink-0'} />
                      <span>{nav.label}</span>
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E6321C] hidden lg:block" />}
                  </button>
                );
              })}

              {/* Logout Button */}
              <div className="pt-2 border-t border-[#DDD3C5]/60 mt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[2px] text-xs font-mono font-bold text-[#6F6A63] hover:text-[#E6321C] hover:bg-[#FDF0EE] transition-colors"
                >
                  <LogOut size={15} />
                  <span>LOGOUT PATRON</span>
                </button>
              </div>
            </div>

            {/* Atelier Policy & Care Card */}
            <div className="border border-[#DDD3C5] bg-[#EDE0CC] p-5 rounded-[2px] text-left hidden lg:block">
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                ATELIER GUARANTEE
              </div>
              <h4 className="font-extrabold uppercase text-xs text-[#171717] mb-2">
                7-Day Doorstep Exchange Policy
              </h4>
              <p className="text-[#6F6A63] text-[11px] leading-[1.7] mb-3">
                Need a size adjustment on your heavyweight tee or hoodie? Reverse courier pickup is complimentary across India.
              </p>
              <Link to="/returns-refunds" className="text-link text-[10px] text-[#171717] hover:text-[#E6321C]">
                READ RETURNS CODE →
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Tab Content */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* ─── TAB: DASHBOARD / OVERVIEW ─── */}
                {activeTab === 'dashboard' && (
                  <>
                    {/* Recent Orders Section */}
                    <div className="border border-[#DDD3C5] bg-white p-6 sm:p-7 rounded-[2px] shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                        <div>
                          <h3 className="font-extrabold uppercase text-base text-[#171717] tracking-tight">
                            Recent Orders
                          </h3>
                          <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                            Track ongoing productions and doorstep dispatches
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-[#E6321C] hover:text-[#B91F12] transition-colors"
                        >
                          <span>VIEW ALL ARCHIVES</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div className="divide-y divide-[#DDD3C5]/60">
                        {isOrdersLoading ? (
                          <div className="py-8 text-center text-xs text-[#6F6A63] font-mono">
                            Loading recent atelier orders...
                          </div>
                        ) : userOrders.length === 0 ? (
                          <div className="py-12 text-center space-y-3">
                            <p className="text-xs text-[#6F6A63]">You haven't placed any garments in your order archive yet.</p>
                            <Link to="/shop" className="btn btn-black text-xs inline-flex items-center gap-2">
                              <ShoppingBag size={14} />
                              <span>EXPLORE ATELIER COLLECTION</span>
                            </Link>
                          </div>
                        ) : (
                          userOrders.slice(0, 3).map((ord: any) => {
                            const firstItem = ord.items?.[0];
                            const itemCount = ord.items?.length || 1;
                            return (
                              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-[2px] bg-[#F7EEDB] border border-[#DDD3C5] flex items-center justify-center shrink-0">
                                    <Shirt size={26} className="text-[#171717]/40" />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-tight">
                                      {firstItem?.title_snapshot || 'Heavyweight Garment'}
                                      {itemCount > 1 ? ` + ${itemCount - 1} more` : ''}
                                    </h4>
                                    <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                                      {firstItem?.variant_snapshot_json?.size ? `Size ${firstItem.variant_snapshot_json.size} • ` : ''}
                                      Qty: {firstItem?.quantity || 1}
                                    </p>
                                    <p className="font-mono font-bold text-sm text-[#171717] mt-1">₹{ord.total}</p>
                                    <span className="text-[10px] text-[#6F6A63] block mt-0.5 font-mono">
                                      ORDER NO: #{ord.order_number}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                                  <div className="text-right">
                                    <span className="text-[11px] text-[#6F6A63] font-mono block">
                                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                                    </span>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-[#171717] text-white">
                                      {ord.status?.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/account/orders/${ord.order_number}`}
                                    className="text-link text-[10px] text-[#E6321C] hover:text-[#B91F12]"
                                  >
                                    VIEW DETAILS →
                                  </Link>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Quick Hub Action Grid */}
                    <div className="space-y-3">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#6F6A63]">
                        PATRON CONVENIENCES
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="p-5 rounded-[2px] border border-[#DDD3C5] bg-white hover:border-[#171717] transition-all block text-left"
                        >
                          <User size={18} className="text-[#E6321C] mb-2" />
                          <h4 className="font-extrabold uppercase text-xs text-[#171717]">Profile Information</h4>
                          <p className="text-[11px] text-[#6F6A63] mt-1">Update personal name and verified contact details</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('addresses')}
                          className="p-5 rounded-[2px] border border-[#DDD3C5] bg-white hover:border-[#171717] transition-all block text-left"
                        >
                          <MapPin size={18} className="text-[#171717] mb-2" />
                          <h4 className="font-extrabold uppercase text-xs text-[#171717]">Shipping Destinations</h4>
                          <p className="text-[11px] text-[#6F6A63] mt-1">Add or manage primary delivery addresses</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('returns')}
                          className="p-5 rounded-[2px] border border-[#DDD3C5] bg-white hover:border-[#171717] transition-all block text-left"
                        >
                          <RotateCcw size={18} className="text-[#238636] mb-2" />
                          <h4 className="font-extrabold uppercase text-xs text-[#171717]">Returns & Exchanges</h4>
                          <p className="text-[11px] text-[#6F6A63] mt-1">Lodge 7-day doorstep size swap or rapid refund</p>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB: PROFILE INFORMATION ─── */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                      <div className="pb-4 border-b border-[#DDD3C5]">
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                          PERSONAL IDENTITY
                        </div>
                        <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                          Patron Profile Details
                        </h3>
                        <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                          Update your name, primary phone number, and delivery coordinates
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateProfileMutation.mutate({
                            fullName: profileForm.fullName || displayName,
                            phone: profileForm.phone || displayPhone,
                          });
                        }}
                        className="space-y-5 max-w-lg"
                      >
                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                            Full Patron Name
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.fullName || displayName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-sans text-[#171717] bg-[#F7EEDB]/30 focus:outline-none focus:border-[#E6321C] transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                            Email Address (Identity Bound)
                          </label>
                          <input
                            type="email"
                            disabled
                            value={displayEmail}
                            className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] bg-[#EDE0CC]/40 text-xs font-mono text-[#6F6A63] cursor-not-allowed"
                          />
                          <span className="font-mono text-[10px] text-[#6F6A63] block mt-1">
                            Email address is permanently bound to your authentication identity.
                          </span>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                            Primary Mobile Number
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone || displayPhone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-mono text-[#171717] bg-[#F7EEDB]/30 focus:outline-none focus:border-[#E6321C] transition-colors"
                          />
                          <span className="font-mono text-[10px] text-[#6F6A63] block mt-1">
                            Used for automated courier dispatch tracking and Razorpay refund updates.
                          </span>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="btn btn-black text-xs min-h-[44px] px-6 rounded-[2px]"
                          >
                            {updateProfileMutation.isPending ? 'SAVING DETAILS...' : 'SAVE PROFILE DETAILS'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Atelier Sizing Preferences Card */}
                    <div className="border border-[#DDD3C5] bg-[#EDE0CC] p-6 sm:p-7 rounded-[2px]">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                        TAILORING SPECIFICATIONS
                      </div>
                      <h4 className="font-extrabold uppercase text-base text-[#171717] mb-2">
                        Preferred Atelier Silhouette
                      </h4>
                      <p className="text-[#6F6A63] text-xs mb-4">
                        Select your favorite cut so our recommendation engine pre-selects your preferred sizing across our 240 GSM tees and French terry hoodies.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'heavyweight_boxy', label: 'Boxy Heavyweight', desc: 'True to size with structured shoulder drop' },
                          { id: 'relaxed_oversized', label: 'Relaxed Oversize', desc: 'Loose silhouette with 2-inch chest room' },
                          { id: 'classic_fitted', label: 'Classic Straight', desc: 'Standard tailored fit hugging chest and arms' },
                        ].map((fit) => (
                          <button
                            key={fit.id}
                            type="button"
                            onClick={() => {
                              setPreferredFit(fit.id);
                              toast({ title: 'Silhouette Saved', description: `${fit.label} set as default.`, variant: 'info' });
                            }}
                            className={`p-4 text-left border rounded-[2px] transition-all ${
                              preferredFit === fit.id
                                ? 'bg-white border-[#171717] shadow-xs'
                                : 'bg-[#F7EEDB]/70 border-[#DDD3C5] hover:bg-white'
                            }`}
                          >
                            <div className="font-extrabold uppercase text-xs text-[#171717] mb-1">{fit.label}</div>
                            <div className="text-[10px] text-[#6F6A63] leading-relaxed">{fit.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: MY ORDERS ─── */}
                {activeTab === 'orders' && (
                  <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                          ORDER ARCHIVE
                        </div>
                        <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                          All Orders & Dispatches
                        </h3>
                      </div>
                      <Link to="/shop" className="btn btn-outline text-xs h-9 px-4 rounded-[2px]">
                        ORDER MORE GARMENTS →
                      </Link>
                    </div>

                    <div className="divide-y divide-[#DDD3C5]/60">
                      {isOrdersLoading ? (
                        <div className="py-12 text-center text-xs font-mono text-[#6F6A63]">
                          Loading order history...
                        </div>
                      ) : userOrders.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                          <Package className="w-8 h-8 text-[#6F6A63] mx-auto opacity-50" />
                          <p className="text-xs text-[#6F6A63]">No orders registered under this account.</p>
                          <Link to="/shop" className="btn btn-black text-xs inline-flex items-center gap-2">
                            <span>SHOP THE CATALOG</span>
                          </Link>
                        </div>
                      ) : (
                        userOrders.map((ord: any) => {
                          const firstItem = ord.items?.[0];
                          const itemCount = ord.items?.length || 1;
                          return (
                            <div key={ord.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-[2px] bg-[#F7EEDB] border border-[#DDD3C5] flex items-center justify-center shrink-0">
                                  <Shirt size={26} className="text-[#171717]/40" />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-tight">
                                    {firstItem?.title_snapshot || 'Heavyweight Apparel Piece'}
                                    {itemCount > 1 ? ` + ${itemCount - 1} other pieces` : ''}
                                  </h4>
                                  <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                                    {firstItem?.variant_snapshot_json?.size ? `Size ${firstItem.variant_snapshot_json.size} • ` : ''}
                                    Total Qty: {itemCount}
                                  </p>
                                  <p className="font-mono font-bold text-sm text-[#171717] mt-1">₹{ord.total}</p>
                                  <span className="text-[10px] text-[#6F6A63] block mt-0.5 font-mono">
                                    ORDER ID: #{ord.order_number}
                                  </span>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                                <div className="text-right">
                                  <span className="text-[11px] text-[#6F6A63] font-mono block">
                                    {new Date(ord.created_at).toLocaleDateString('en-IN')}
                                  </span>
                                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-[#171717] text-white">
                                    {ord.status?.replace('_', ' ')}
                                  </span>
                                </div>
                                <Link
                                  to={`/account/orders/${ord.order_number}`}
                                  className="btn btn-outline text-[10px] h-8 px-3 rounded-[2px]"
                                >
                                  VIEW INVOICE & TRACK →
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ─── TAB: ADDRESSES ─── */}
                {activeTab === 'addresses' && (
                  <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#DDD3C5]">
                      <div>
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                          DESTINATIONS
                        </div>
                        <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                          Saved Shipping Destinations
                        </h3>
                        <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                          Manage locations for express doorstep delivery
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(true)}
                        className="btn btn-black text-xs h-9 px-4 rounded-[2px] inline-flex items-center gap-1.5"
                      >
                        <Plus size={14} /> <span>ADD ADDRESS</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] font-mono">
                        No saved shipping addresses found. Click &quot;ADD ADDRESS&quot; to register your primary delivery location.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr: any) => (
                          <div key={addr.id} className="p-5 rounded-[2px] border border-[#DDD3C5] bg-[#F7EEDB]/40 relative space-y-2">
                            {addr.is_default && (
                              <span className="inline-block px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-[#E6321C] text-white">
                                PRIMARY DEFAULT
                              </span>
                            )}
                            <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-tight">{addr.name}</h4>
                            <p className="text-xs text-[#6F6A63] leading-relaxed">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-xs text-[#6F6A63] font-mono">{addr.city}, {addr.state} - {addr.postal_code}</p>
                            <p className="text-xs text-[#6F6A63] font-mono">Phone: {addr.phone}</p>
                            <div className="pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => deleteAddressMutation.mutate(addr.id)}
                                className="text-xs text-[#E6321C] hover:underline inline-flex items-center gap-1 font-mono font-bold uppercase"
                              >
                                <Trash2 size={13} /> Delete Address
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB: SECURITY & PASSWORD ─── */}
                {activeTab === 'password' && (
                  <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5]">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                        CREDENTIAL SECURITY
                      </div>
                      <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                        Update Access Password
                      </h3>
                      <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                        Ensure your account uses an encrypted, high-strength password
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                          toast({ title: 'Passwords do not match', variant: 'danger' });
                          return;
                        }
                        changePasswordMutation.mutate({
                          currentPassword: passwordForm.currentPassword,
                          newPassword: passwordForm.newPassword,
                        });
                      }}
                      className="space-y-4 max-w-lg"
                    >
                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-sans text-[#171717] bg-[#F7EEDB]/30 focus:outline-none focus:border-[#E6321C]"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                          New Password (Minimum 6 characters)
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-sans text-[#171717] bg-[#F7EEDB]/30 focus:outline-none focus:border-[#E6321C]"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-sans text-[#171717] bg-[#F7EEDB]/30 focus:outline-none focus:border-[#E6321C]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="btn btn-black text-xs min-h-[44px] px-6 rounded-[2px]"
                        >
                          {changePasswordMutation.isPending ? 'UPDATING CREDENTIALS...' : 'UPDATE PASSWORD'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ─── TAB: RETURNS & REFUNDS ─── */}
                {activeTab === 'returns' && (
                  <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD3C5]">
                      <div>
                        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                          REVERSE LOGISTICS
                        </div>
                        <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                          Returns & Size Exchanges
                        </h3>
                        <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                          7-day doorstep size swap or rapid refund status tracking
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReturnModalOpen(true)}
                        className="btn btn-black text-xs h-9 px-4 rounded-[2px] inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={14} /> <span>LOG NEW RETURN</span>
                      </button>
                    </div>

                    {userReturns.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] font-mono space-y-2">
                        <p>No active return requests logged.</p>
                        <p className="text-[11px]">All orders delivered within 7 calendar days are eligible for complimentary reverse pickup.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DDD3C5]/60">
                        {userReturns.map((ret: any) => (
                          <div key={ret.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-tight">
                                {ret.garment_title} (Size {ret.size})
                              </h4>
                              <span className="text-xs text-[#6F6A63] font-mono block mt-0.5">
                                ORDER NO: #{ret.order_number}
                              </span>
                              <p className="text-xs text-[#6F6A63] mt-1">
                                Reason: <strong className="text-[#171717] uppercase">{ret.reason.replace('_', ' ')}</strong> • &quot;{ret.comments}&quot;
                              </p>
                              <p className="text-xs font-mono font-bold text-[#171717] mt-1">
                                Refund / Exchange Amount: ₹{ret.refund_amount}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold uppercase bg-[#171717] text-white">
                                {ret.status.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-[#6F6A63] font-mono block mt-1">
                                Lodged: {new Date(ret.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── TAB: REVIEWS ─── */}
                {activeTab === 'reviews' && (
                  <div className="border border-[#DDD3C5] bg-white p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5]">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-1">
                        AUTHENTIC FEEDBACK
                      </div>
                      <h3 className="font-extrabold uppercase text-xl text-[#171717] tracking-tight">
                        My Garment Reviews
                      </h3>
                      <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                        Ratings and craftsmanship impressions you submitted
                      </p>
                    </div>

                    {userReviews.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] font-mono">
                        You haven&apos;t written any reviews yet. Visit any product page in our shop to review your garments!
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DDD3C5]/60">
                        {userReviews.map((rev: any) => (
                          <div key={rev.id} className="py-4 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-extrabold text-sm text-[#171717] uppercase tracking-tight">
                                {rev.product_title || 'Garment Craftsmanship Review'}
                              </h4>
                              <div className="flex items-center text-[#B7791F] text-xs">
                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                              </div>
                            </div>
                            {rev.title && <p className="text-xs font-bold text-[#171717]">{rev.title}</p>}
                            <p className="text-xs text-[#6F6A63] leading-relaxed">{rev.body}</p>
                            <span className="text-[10px] text-[#6F6A63] block font-mono">
                              Posted on {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* =======================================================
             NEWSLETTER DISPATCH STRIP
        ======================================================= */}
        <div className="border border-[#DDD3C5] bg-[#EDE0CC] p-6 sm:p-8 rounded-[2px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-[2px] bg-[#171717] text-[#F7EEDB] flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#E6321C]">
                PRIVATE ATELIER DISPATCHES
              </div>
              <h3 className="font-extrabold uppercase text-base text-[#171717] tracking-tight">
                Get Private Drop Alerts & First Access
              </h3>
              <p className="text-xs text-[#6F6A63] font-mono mt-0.5">
                New heavy cotton cuts, limited DTF capsule releases, and invitations.
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
              className="flex-1 px-4 py-2.5 rounded-[2px] border border-[#DDD3C5] bg-white text-xs font-mono text-[#171717] focus:outline-none focus:border-[#E6321C]"
            />
            <button
              type="submit"
              className="btn btn-black text-xs h-10 px-5 rounded-[2px] shrink-0"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      {/* =======================================================
           EDIT PROFILE MODAL
      ======================================================= */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.98, opacity: 0, y: 10 }}
              className="w-full max-w-md bg-white border border-[#DDD3C5] rounded-[2px] p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold uppercase text-base text-[#171717] tracking-tight">
                  Edit Profile Details
                </h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-[#6F6A63] hover:text-[#171717]">
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate(profileForm);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                    Full Patron Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-sans focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#DDD3C5] text-xs font-mono focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="btn btn-outline text-xs h-9 px-4 rounded-[2px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn btn-black text-xs h-9 px-5 rounded-[2px]"
                  >
                    {updateProfileMutation.isPending ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================
           ADD ADDRESS MODAL
      ======================================================= */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.98, opacity: 0, y: 10 }}
              className="w-full max-w-lg bg-white border border-[#DDD3C5] rounded-[2px] p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold uppercase text-base text-[#171717] tracking-tight">
                  Add Shipping Destination
                </h3>
                <button onClick={() => setIsAddAddressOpen(false)} className="text-[#6F6A63] hover:text-[#171717]">
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddressMutation.mutate(newAddressForm);
                }}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.name}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                    Street Address / House / Flat
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / Building / Road"
                    value={newAddressForm.line1}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                    className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.state}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddressForm.postalCode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="btn btn-outline text-xs h-9 px-4 rounded-[2px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="btn btn-black text-xs h-9 px-5 rounded-[2px]"
                  >
                    SAVE DESTINATION
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================
           REQUEST RETURN / SIZE SWAP MODAL
      ======================================================= */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.98, opacity: 0, y: 10 }}
              className="w-full max-w-md bg-white border border-[#DDD3C5] rounded-[2px] p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold uppercase text-base text-[#171717] tracking-tight">
                  Request Return / Size Exchange
                </h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-[#6F6A63] hover:text-[#171717]">
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createReturnMutation.mutate(returnForm);
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BING-89412"
                    value={returnForm.orderNumber}
                    onChange={(e) => setReturnForm({ ...returnForm, orderNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                    Garment Title & Sizing
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 240 GSM Boxy Heavyweight Tee"
                    value={returnForm.garmentTitle}
                    onChange={(e) => setReturnForm({ ...returnForm, garmentTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                    Reason for Exchange
                  </label>
                  <select
                    value={returnForm.reason}
                    onChange={(e: any) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans bg-white"
                  >
                    <option value="size_fit">Size / Fit Exchange (Swap size)</option>
                    <option value="print_defect">Fabric / Print Inspection Defect</option>
                    <option value="wrong_item">Incorrect Item Handover</option>
                    <option value="fabric_feel">Fabric Feel Preference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase text-[#171717] mb-1">
                    Notes / Preferred Exchange Size
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Please specify your desired replacement size or reason for return..."
                    value={returnForm.comments}
                    onChange={(e) => setReturnForm({ ...returnForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-[2px] border border-[#DDD3C5] text-xs font-sans"
                  />
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="btn btn-outline text-xs h-9 px-4 rounded-[2px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={createReturnMutation.isPending}
                    className="btn btn-black text-xs h-9 px-5 rounded-[2px]"
                  >
                    SUBMIT REQUEST
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default AccountPage;

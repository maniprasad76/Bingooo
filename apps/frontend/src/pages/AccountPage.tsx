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
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useRecentlyViewedStore } from '../store/recentlyViewed';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';
import { OrderRowSkeleton } from '../components/ui/Skeleton';

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package, href: '/account/orders' },
  { id: 'addresses', label: 'Shipping Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist Vault', icon: Heart, href: '/account/wishlist' },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Eye, href: '/recently-viewed' },
  { id: 'password', label: 'Security & Password', icon: Lock },
  { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
  { id: 'reviews', label: 'My Reviews', icon: Star },
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
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = useState(false);
  const recentCount = useRecentlyViewedStore((s) => s.items.length);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);

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

  // Sizing preference state
  const [preferredFit, setPreferredFit] = useState('heavyweight_boxy');

  // Queries
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<any>('/users/profile'),
    enabled: !!authUser,
    retry: false,
  });

  const { data: userOrders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => api.get<any[]>('/orders'),
    enabled: !!authUser,
    retry: false,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get<any[]>('/wishlist'),
    enabled: !!authUser,
    retry: false,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get<any[]>('/users/addresses'),
    enabled: !!authUser,
    retry: false,
  });

  const { data: userReturns = [] } = useQuery({
    queryKey: ['user-returns'],
    queryFn: () => api.get<any[]>('/returns/my'),
    enabled: !!authUser,
    retry: false,
  });

  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-reviews'],
    queryFn: () => api.get<any[]>('/reviews/my'),
    enabled: !!authUser,
    retry: false,
  });

  const displayName = profile?.full_name || profile?.fullName || authUser?.fullName || 'Bingooo Member';
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
    onError: (err: any) => {
      toast({ title: 'Could not save address', description: err.message, variant: 'danger' });
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

  const handleSyncOrders = async () => {
    triggerHaptic('medium');
    setIsSyncingOrders(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      await queryClient.refetchQueries({ queryKey: ['user-orders'] });
      toast({
        title: 'Purchases Synchronized',
        description: 'Your order history and active dispatches have been re-synchronized.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Sync Notice',
        description: 'Unable to reach the server. Displaying local order archive.',
        variant: 'info',
      });
    } finally {
      setIsSyncingOrders(false);
    }
  };

  const handleDeleteAccount = async () => {
    triggerHaptic('error');
    setIsDeletingAccount(true);
    try {
      await api.delete('/users/profile');
      toast({
        title: 'Account Deleted',
        description: 'Your account and personal data have been permanently removed.',
        variant: 'success',
      });
      setIsDeleteAccountModalOpen(false);
      logout();
      navigate('/');
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err?.message || 'Could not process account deletion. Please try again.',
        variant: 'danger',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || isSubscribingNewsletter) return;
    setIsSubscribingNewsletter(true);
    try {
      await api.post('/users/newsletter', { email: newsletterEmail.trim() }).catch(() => {});
      toast({
        title: 'Subscribed to updates!',
        description: 'You will receive our latest drop alerts and atelier releases.',
        variant: 'success',
      });
      setNewsletterEmail('');
    } finally {
      setIsSubscribingNewsletter(false);
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complete') || s.includes('paid')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('ship') || s.includes('transit') || s.includes('process')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s.includes('cancel') || s.includes('reject') || s.includes('fail')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-[#171717] text-white border-[#171717]';
  };

  return (
    <main className="w-full bg-[#F7EEDB] text-[#171717] min-h-screen font-sans antialiased selection:bg-[#E6321C] selection:text-white pb-16">
      <SEO
        title="My Account & Profile — Bingooo Men's Wear"
        description="Manage your Bingooo profile, view orders, track dispatches, update addresses, and manage your wishlist."
        noindex={true}
      />

      {/* ── Breadcrumb Bar ── */}
      <div className="border-b border-[#DDD3C5] bg-[#EDE0CC]/40 px-4 sm:px-8 py-3 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[#6F6A63] text-xs font-medium">
            <Link to="/" className="hover:text-[#171717] transition-colors">Home</Link>
            <span className="text-[#DDD3C5]">/</span>
            <span className="text-[#6F6A63]">Account</span>
            <span className="text-[#DDD3C5]">/</span>
            <span className="text-[#171717] font-semibold">Overview</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-medium text-[#171717]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#6F6A63]">Active Member • Free Doorstep Exchanges</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* =======================================================
             HERO: PREMIUM PROFILE CARD
        ======================================================= */}
        <section className="bg-white border border-[#DDD3C5] rounded-2xl p-6 sm:p-8 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full lg:w-auto">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#1F1D1B] to-[#171717] text-[#F7EEDB] font-bold text-3xl flex items-center justify-center shadow-sm ring-4 ring-[#EDE0CC]/50">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-2 ring-white">
                  <CheckCircle2 size={14} className="stroke-[2.5]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6321C]/10 text-[#E6321C] text-[11px] font-bold tracking-wide uppercase">
                  <Sparkles size={12} />
                  <span>Verified Member</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
                  {displayName}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6F6A63]">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-[#171717]" />
                    <span>{displayEmail}</span>
                  </div>
                  <span className="hidden sm:inline text-[#DDD3C5]">•</span>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} className="text-[#171717]" />
                    <span>{displayPhone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({ fullName: displayName, phone: displayPhone });
                      setIsEditProfileOpen(true);
                    }}
                    className="h-9 px-4 rounded-xl bg-[#171717] text-white text-xs font-bold hover:bg-black transition-all inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit3 size={13} />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className="h-9 px-4 rounded-xl border border-[#DDD3C5] bg-white text-[#171717] text-xs font-bold hover:bg-[#F7EEDB] transition-all inline-flex items-center gap-1.5"
                  >
                    <MapPin size={13} className="text-[#E6321C]" />
                    <span>Addresses</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Modern Stat Cards */}
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#DDD3C5] lg:pl-8">
              {/* Stat 1: Orders */}
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F7EEDB]/50 hover:bg-[#F7EEDB] border border-[#DDD3C5]/80 hover:border-[#171717] transition-all text-left group"
              >
                <div className="flex items-center justify-between text-[#6F6A63] mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">Orders</span>
                  <ShoppingBag size={14} className="text-[#171717] group-hover:text-[#E6321C] transition-colors" />
                </div>
                <div className="text-2xl font-extrabold text-[#171717]">{userOrders.length}</div>
                <div className="text-[11px] font-semibold text-[#E6321C] flex items-center gap-1 mt-1">
                  <span>View archive</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              {/* Stat 2: Wishlist */}
              <Link
                to="/account/wishlist"
                className="p-3.5 sm:p-4 rounded-xl bg-[#F7EEDB]/50 hover:bg-[#F7EEDB] border border-[#DDD3C5]/80 hover:border-[#171717] transition-all text-left group block"
              >
                <div className="flex items-center justify-between text-[#6F6A63] mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">Wishlist</span>
                  <Heart size={14} className="text-[#E6321C]" />
                </div>
                <div className="text-2xl font-extrabold text-[#E6321C]">{wishlist.length}</div>
                <div className="text-[11px] font-semibold text-[#171717] flex items-center gap-1 mt-1">
                  <span>Saved pieces</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Stat 3: Recently Viewed */}
              <Link
                to="/recently-viewed"
                className="p-3.5 sm:p-4 rounded-xl bg-[#F7EEDB]/50 hover:bg-[#F7EEDB] border border-[#DDD3C5]/80 hover:border-[#171717] transition-all text-left group block"
              >
                <div className="flex items-center justify-between text-[#6F6A63] mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">Recent</span>
                  <Eye size={14} className="text-[#171717] group-hover:text-[#E6321C] transition-colors" />
                </div>
                <div className="text-2xl font-extrabold text-[#171717]">{recentCount}</div>
                <div className="text-[11px] font-semibold text-[#171717] flex items-center gap-1 mt-1">
                  <span>History</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Stat 4: Addresses */}
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className="p-3.5 sm:p-4 rounded-xl bg-[#F7EEDB]/50 hover:bg-[#F7EEDB] border border-[#DDD3C5]/80 hover:border-[#171717] transition-all text-left group"
              >
                <div className="flex items-center justify-between text-[#6F6A63] mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">Addresses</span>
                  <MapPin size={14} className="text-[#171717] group-hover:text-[#E6321C] transition-colors" />
                </div>
                <div className="text-2xl font-extrabold text-[#171717]">{addresses.length}</div>
                <div className="text-[11px] font-semibold text-[#171717] flex items-center gap-1 mt-1">
                  <span>Manage</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* =======================================================
             MAIN WORKSPACE: SIDEBAR / TABS + CONTENT
        ======================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Navigation Tabs */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Tab Container (Horizontal pill scroll on mobile, sleek vertical list on desktop) */}
            <div className="bg-white border border-[#DDD3C5] rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <div className="hidden lg:block px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6F6A63] border-b border-[#DDD3C5]/60 mb-2">
                Account Navigation
              </div>

              <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {SIDEBAR_NAV.map((nav) => {
                  const Icon = nav.icon;
                  const isActive = activeTab === nav.id;

                  if (nav.href) {
                    return (
                      <Link
                        key={nav.id}
                        to={nav.href}
                        onClick={() => triggerHaptic('light')}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#171717] hover:bg-[#F7EEDB] hover:text-[#E6321C] transition-all shrink-0 whitespace-nowrap lg:w-full"
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={16} className="text-[#6F6A63] shrink-0" />
                          <span>{nav.label}</span>
                        </span>
                        <ExternalLink size={12} className="text-[#6F6A63] hidden lg:block opacity-60" />
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
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap lg:w-full cursor-pointer ${
                        isActive
                          ? 'bg-[#171717] text-white font-bold shadow-xs'
                          : 'text-[#171717] hover:bg-[#F7EEDB] hover:text-[#E6321C]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-[#E6321C]' : 'text-[#6F6A63]'} />
                        <span>{nav.label}</span>
                      </span>

                      {/* Count badge indicator if applicable */}
                      {nav.id === 'orders' && userOrders.length > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold hidden lg:inline-block ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#EDE0CC] text-[#171717]'
                        }`}>
                          {userOrders.length}
                        </span>
                      )}

                      {nav.id === 'addresses' && addresses.length > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold hidden lg:inline-block ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#EDE0CC] text-[#171717]'
                        }`}>
                          {addresses.length}
                        </span>
                      )}

                      {isActive && <ChevronRight size={14} className="hidden lg:block text-[#E6321C]" />}
                    </button>
                  );
                })}

                {/* Logout Button */}
                <div className="pt-2 border-t border-[#DDD3C5]/60 mt-1 lg:mt-2 hidden lg:block">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Assistance / Guarantee Card */}
            <div className="bg-gradient-to-br from-[#EDE0CC] to-[#F7EEDB] border border-[#DDD3C5] p-5 rounded-2xl text-left hidden lg:block space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-[#E6321C] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>Bingooo Promise</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#171717]">
                7-Day Complimentary Exchange
              </h4>
              <p className="text-[#6F6A63] text-xs leading-relaxed">
                Need a size adjustment on your heavyweight tee or hoodie? Reverse courier pickup is complimentary across India.
              </p>
              <Link to="/returns-refunds" className="inline-flex items-center gap-1 text-xs font-bold text-[#171717] hover:text-[#E6321C] transition-colors pt-1">
                <span>View Exchange Policy</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </aside>

          {/* Right Column: Tab Content */}
          <main className="lg:col-span-8 space-y-6">
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
                    <div className="bg-white border border-[#DDD3C5] p-6 sm:p-7 rounded-2xl shadow-xs space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-[#DDD3C5]">
                        <div>
                          <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
                            Recent Orders
                          </h2>
                          <p className="text-xs text-[#6F6A63] mt-0.5">
                            Track your active dispatches and recent wardrobe additions
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6321C] hover:text-[#B91F12] transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      <div className="divide-y divide-[#DDD3C5]/60">
                        {isOrdersLoading ? (
                          <div className="py-4 space-y-3">
                            <OrderRowSkeleton />
                            <OrderRowSkeleton />
                          </div>
                        ) : userOrders.length === 0 ? (
                          <div className="py-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-[#F7EEDB] text-[#171717] flex items-center justify-center mx-auto">
                              <Package size={22} className="opacity-70" />
                            </div>
                            <p className="text-sm font-semibold text-[#171717]">No orders yet</p>
                            <p className="text-xs text-[#6F6A63] max-w-sm mx-auto">
                              Your closet is waiting for our premium heavyweight tees and relaxed streetwear.
                            </p>
                            <Link to="/shop" className="btn btn-black text-xs inline-flex items-center gap-2 rounded-xl mt-2">
                              <ShoppingBag size={14} />
                              <span>Explore Collection</span>
                            </Link>
                          </div>
                        ) : (
                          userOrders.slice(0, 3).map((ord: any) => {
                            const firstItem = ord.items?.[0];
                            const itemCount = ord.items?.length || 1;
                            return (
                              <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-xl bg-[#F7EEDB] border border-[#DDD3C5] flex items-center justify-center shrink-0">
                                    <Shirt size={24} className="text-[#171717]/60" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-sm text-[#171717]">
                                      {firstItem?.title_snapshot || 'Heavyweight Garment'}
                                      {itemCount > 1 ? ` + ${itemCount - 1} more` : ''}
                                    </h3>
                                    <p className="text-xs text-[#6F6A63] mt-0.5">
                                      {firstItem?.variant_snapshot_json?.size ? `Size ${firstItem.variant_snapshot_json.size} • ` : ''}
                                      Qty: {firstItem?.quantity || 1}
                                    </p>
                                    <p className="font-bold text-sm text-[#171717] mt-1">₹{ord.total}</p>
                                    <span className="text-[11px] text-[#6F6A63] block font-mono">
                                      #{ord.order_number}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                                  <div className="text-right">
                                    <span className="text-xs text-[#6F6A63] block">
                                      {new Date(ord.created_at).toLocaleDateString('en-IN')}
                                    </span>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(ord.status)}`}>
                                      {ord.status?.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/account/orders/${ord.order_number}`}
                                    className="text-xs font-bold text-[#E6321C] hover:underline"
                                  >
                                    View Details →
                                  </Link>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#6F6A63]">
                        Account Shortcuts
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab('profile')}
                          className="p-5 rounded-2xl border border-[#DDD3C5] bg-white hover:border-[#171717] hover:shadow-xs transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#E6321C]/10 text-[#E6321C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                            <User size={20} />
                          </div>
                          <h4 className="font-bold text-sm text-[#171717]">Profile Information</h4>
                          <p className="text-xs text-[#6F6A63] mt-1">Update your name, email, and phone number</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('addresses')}
                          className="p-5 rounded-2xl border border-[#DDD3C5] bg-white hover:border-[#171717] hover:shadow-xs transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#171717]/10 text-[#171717] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                            <MapPin size={20} />
                          </div>
                          <h4 className="font-bold text-sm text-[#171717]">Shipping Destinations</h4>
                          <p className="text-xs text-[#6F6A63] mt-1">Manage delivery locations and default addresses</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('returns')}
                          className="p-5 rounded-2xl border border-[#DDD3C5] bg-white hover:border-[#171717] hover:shadow-xs transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                            <RotateCcw size={20} />
                          </div>
                          <h4 className="font-bold text-sm text-[#171717]">Returns & Exchanges</h4>
                          <p className="text-xs text-[#6F6A63] mt-1">Lodge 7-day doorstep size swap or rapid refund</p>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ─── TAB: PROFILE INFORMATION ─── */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                      <div className="pb-4 border-b border-[#DDD3C5]">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                          Personal Information
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                          Profile Details
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6F6A63] mt-1">
                          Manage your personal details and contact preferences
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
                        className="space-y-5 max-w-xl"
                      >
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.fullName || displayName}
                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] text-sm text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C] transition-all"
                            placeholder="Your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            disabled
                            value={displayEmail}
                            className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] bg-[#EDE0CC]/40 text-sm text-[#6F6A63] cursor-not-allowed"
                          />
                          <span className="text-xs text-[#6F6A63] block mt-1.5">
                            Email address is linked to your login provider and cannot be changed.
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                            Mobile Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileForm.phone || displayPhone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] text-sm text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C] transition-all"
                            placeholder="+91 98765 43210"
                          />
                          <span className="text-xs text-[#6F6A63] block mt-1.5">
                            Used for courier delivery updates and order notifications.
                          </span>
                        </div>

                        <div className="pt-3">
                          <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="h-11 px-6 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs disabled:opacity-50"
                          >
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Sizing & Fit Preferences Card */}
                    <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C]">
                        Wardrobe Preferences
                      </div>
                      <h3 className="text-lg font-extrabold text-[#171717]">
                        Preferred Garment Fit
                      </h3>
                      <p className="text-xs text-[#6F6A63]">
                        Select your favorite cut so we can recommend your ideal fit across our 240 GSM heavy cotton pieces.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                        {[
                          { id: 'heavyweight_boxy', label: 'Boxy Heavyweight', desc: 'Structured shoulder drop with true-to-size length' },
                          { id: 'relaxed_oversized', label: 'Relaxed Oversize', desc: 'Roomy silhouette with relaxed streetwear drape' },
                          { id: 'classic_fitted', label: 'Classic Straight', desc: 'Clean standard tailored cut for everyday comfort' },
                        ].map((fit) => {
                          const isSelected = preferredFit === fit.id;
                          return (
                            <button
                              key={fit.id}
                              type="button"
                              onClick={() => {
                                setPreferredFit(fit.id);
                                toast({ title: 'Preference Saved', description: `${fit.label} selected.`, variant: 'info' });
                              }}
                              className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                                  : 'bg-[#F7EEDB]/40 border-[#DDD3C5] hover:bg-white text-[#171717]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="font-bold text-xs uppercase tracking-wide">{fit.label}</div>
                                {isSelected && <Check size={14} className="text-[#E6321C]" />}
                              </div>
                              <div className={`text-xs leading-relaxed ${isSelected ? 'text-[#EDE0CC]' : 'text-[#6F6A63]'}`}>
                                {fit.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: MY ORDERS ─── */}
                {activeTab === 'orders' && (
                  <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                          Purchases
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                          My Orders
                        </h2>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleSyncOrders}
                          disabled={isSyncingOrders}
                          className="h-9 px-3.5 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB] transition-all inline-flex items-center gap-1.5"
                        >
                          <RotateCcw size={13} className={isSyncingOrders ? 'animate-spin' : ''} />
                          <span>{isSyncingOrders ? 'Syncing...' : 'Sync Orders'}</span>
                        </button>
                        <Link to="/shop" className="h-9 px-4 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1 transition-all">
                          <span>Shop More</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>

                    <div className="divide-y divide-[#DDD3C5]/60">
                      {isOrdersLoading ? (
                        <div className="py-12 text-center text-xs text-[#6F6A63]">
                          Loading orders...
                        </div>
                      ) : userOrders.length === 0 ? (
                        <div className="py-16 text-center space-y-3">
                          <Package className="w-10 h-10 text-[#6F6A63] mx-auto opacity-40" />
                          <p className="text-sm font-semibold text-[#171717]">No orders registered yet</p>
                          <p className="text-xs text-[#6F6A63]">All your confirmed purchases and tracking links will appear here.</p>
                          <Link to="/shop" className="btn btn-black text-xs inline-flex items-center gap-2 rounded-xl mt-2">
                            <span>Browse Bingooo Collection</span>
                          </Link>
                        </div>
                      ) : (
                        userOrders.map((ord: any) => {
                          const firstItem = ord.items?.[0];
                          const itemCount = ord.items?.length || 1;
                          return (
                            <div key={ord.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-[#F7EEDB] border border-[#DDD3C5] flex items-center justify-center shrink-0">
                                  <Shirt size={26} className="text-[#171717]/60" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-[#171717]">
                                    {firstItem?.title_snapshot || 'Heavyweight Garment'}
                                    {itemCount > 1 ? ` + ${itemCount - 1} other pieces` : ''}
                                  </h4>
                                  <p className="text-xs text-[#6F6A63] mt-0.5">
                                    {firstItem?.variant_snapshot_json?.size ? `Size ${firstItem.variant_snapshot_json.size} • ` : ''}
                                    Quantity: {itemCount}
                                  </p>
                                  <p className="font-bold text-sm text-[#171717] mt-1">₹{ord.total}</p>
                                  <span className="text-xs text-[#6F6A63] block font-mono">
                                    Order ID: #{ord.order_number}
                                  </span>
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                                <div className="text-right">
                                  <span className="text-xs text-[#6F6A63] block">
                                    {new Date(ord.created_at).toLocaleDateString('en-IN')}
                                  </span>
                                  <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(ord.status)}`}>
                                    {ord.status?.replace('_', ' ')}
                                  </span>
                                </div>
                                <Link
                                  to={`/account/orders/${ord.order_number}`}
                                  className="h-8 px-3 rounded-lg border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB] transition-all inline-flex items-center gap-1"
                                >
                                  <span>View & Track</span>
                                  <ArrowRight size={11} />
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
                  <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#DDD3C5]">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                          Delivery
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                          Saved Addresses
                        </h2>
                        <p className="text-xs text-[#6F6A63] mt-0.5">
                          Manage your doorstep delivery locations
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddAddressOpen(true)}
                        className="h-9 px-4 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Plus size={14} /> <span>Add New</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] space-y-2">
                        <MapPin size={32} className="mx-auto text-[#6F6A63]/40" />
                        <p className="font-semibold text-sm text-[#171717]">No saved addresses</p>
                        <p>Add your home or office address for faster 1-click checkout.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr: any) => (
                          <div key={addr.id} className="p-5 rounded-xl border border-[#DDD3C5] bg-[#F7EEDB]/30 relative space-y-2">
                            {addr.is_default && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E6321C] text-white tracking-wide">
                                Default Destination
                              </span>
                            )}
                            <h4 className="font-bold text-sm text-[#171717]">{addr.name}</h4>
                            <p className="text-xs text-[#6F6A63] leading-relaxed">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                            <p className="text-xs text-[#6F6A63]">{addr.city}, {addr.state} — {addr.postal_code}</p>
                            <p className="text-xs text-[#6F6A63]">Phone: {addr.phone}</p>
                            <div className="pt-3 border-t border-[#DDD3C5]/60 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => deleteAddressMutation.mutate(addr.id)}
                                className="text-xs text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                <Trash2 size={13} /> Remove
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
                  <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                        Security
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                        Account Password
                      </h2>
                      <p className="text-xs text-[#6F6A63] mt-0.5">
                        Ensure your account has a secure and strong password
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
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] text-sm text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                          New Password (At least 6 characters)
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] text-sm text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] text-sm text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C]"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                          className="h-11 px-6 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>

                    {/* ─── DANGER ZONE: ACCOUNT DELETION ─── */}
                    <div className="mt-8 border border-red-200 bg-red-50/40 p-6 rounded-2xl space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-rose-600 flex items-center justify-center shrink-0">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-[#171717]">
                            Delete Account & Personal Data
                          </h4>
                          <p className="text-xs text-[#6F6A63] leading-relaxed mt-1">
                            Permanently delete your account, saved addresses, and preferences. In accordance with data privacy regulations, all your profile records will be permanently erased.
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-red-200/60 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsDeleteAccountModalOpen(true)}
                          className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold tracking-wide inline-flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete My Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: RETURNS & REFUNDS ─── */}
                {activeTab === 'returns' && (
                  <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD3C5]">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                          Returns & Exchanges
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                          Size Swaps & Refunds
                        </h2>
                        <p className="text-xs text-[#6F6A63] mt-0.5">
                          Complimentary 7-day reverse pickup on all eligible apparel
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReturnModalOpen(true)}
                        className="h-9 px-4 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw size={14} /> <span>Request Exchange</span>
                      </button>
                    </div>

                    {userReturns.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] space-y-2">
                        <p className="font-semibold text-sm text-[#171717]">No active return requests</p>
                        <p>Delivered orders within 7 calendar days are eligible for easy doorstep replacement or full refund.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DDD3C5]/60">
                        {userReturns.map((ret: any) => (
                          <div key={ret.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-sm text-[#171717]">
                                {ret.garment_title} (Size {ret.size})
                              </h4>
                              <span className="text-xs text-[#6F6A63] block mt-0.5 font-mono">
                                Order No: #{ret.order_number}
                              </span>
                              <p className="text-xs text-[#6F6A63] mt-1">
                                Reason: <span className="font-semibold text-[#171717]">{ret.reason.replace('_', ' ')}</span> • &quot;{ret.comments}&quot;
                              </p>
                              <p className="text-xs font-bold text-[#171717] mt-1">
                                Value: ₹{ret.refund_amount}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(ret.status)}`}>
                                {ret.status.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-[#6F6A63] block mt-1">
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
                  <div className="bg-white border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                    <div className="pb-4 border-b border-[#DDD3C5]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C] mb-1">
                        Feedback
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#171717] tracking-tight">
                        My Garment Reviews
                      </h2>
                      <p className="text-xs text-[#6F6A63] mt-0.5">
                        Ratings and craftsmanship impressions you submitted
                      </p>
                    </div>

                    {userReviews.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#6F6A63] space-y-2">
                        <Star size={28} className="mx-auto text-amber-400 opacity-50" />
                        <p className="font-semibold text-sm text-[#171717]">No reviews yet</p>
                        <p>After receiving your pieces, leave a rating to help the Bingooo community!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#DDD3C5]/60">
                        {userReviews.map((rev: any) => (
                          <div key={rev.id} className="py-4 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-[#171717]">
                                {rev.product_title || 'Garment Review'}
                              </h4>
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[1, 2, 3, 4, 5].map((starIdx) => (
                                  <Star
                                    key={starIdx}
                                    size={13}
                                    className={
                                      starIdx <= (rev.rating || 5)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-[#DDD3C5]'
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            {rev.title && <p className="text-xs font-bold text-[#171717]">{rev.title}</p>}
                            <p className="text-xs text-[#6F6A63] leading-relaxed">{rev.body}</p>
                            <span className="text-[11px] text-[#6F6A63] block">
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
          </main>
        </div>

        {/* =======================================================
             NEWSLETTER DISPATCH STRIP
        ======================================================= */}
        <section className="bg-gradient-to-br from-[#EDE0CC] to-[#F7EEDB] border border-[#DDD3C5] p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#171717] text-[#F7EEDB] flex items-center justify-center shrink-0 shadow-xs">
              <Mail size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E6321C]">
                Private Member Alerts
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#171717] tracking-tight">
                Exclusive Drop Alerts & Capsule Releases
              </h3>
              <p className="text-xs text-[#6F6A63] mt-0.5">
                First access to heavy cotton cuts, limited graphics, and seasonal sales.
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#E6321C]/20 focus:border-[#E6321C]"
            />
            <button
              type="submit"
              disabled={isSubscribingNewsletter}
              className="h-10 px-5 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wide shrink-0 transition-all"
            >
              {isSubscribingNewsletter ? 'Joining...' : 'Subscribe'}
            </button>
          </form>
        </section>
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
              className="w-full max-w-md bg-white border border-[#DDD3C5] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold text-base text-[#171717] tracking-tight">
                  Edit Profile Details
                </h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-[#6F6A63] hover:text-[#171717] p-1">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] text-xs text-[#171717] focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] text-xs text-[#171717] focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="h-10 px-4 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="h-10 px-5 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold tracking-wide shadow-xs"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
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
              className="w-full max-w-lg bg-white border border-[#DDD3C5] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold text-base text-[#171717] tracking-tight">
                  Add Shipping Destination
                </h3>
                <button onClick={() => setIsAddAddressOpen(false)} className="text-[#6F6A63] hover:text-[#171717] p-1">
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
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.name}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Street Address / House / Flat
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / Building / Road"
                    value={newAddressForm.line1}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.state}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddressForm.postalCode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(false)}
                    className="h-10 px-4 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending}
                    className="h-10 px-5 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                  >
                    Save Address
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
              className="w-full max-w-md bg-white border border-[#DDD3C5] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-extrabold text-base text-[#171717] tracking-tight">
                  Request Return / Size Exchange
                </h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-[#6F6A63] hover:text-[#171717] p-1">
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
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BING-89412"
                    value={returnForm.orderNumber}
                    onChange={(e) => setReturnForm({ ...returnForm, orderNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Garment Title & Size
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 240 GSM Boxy Heavyweight Tee"
                    value={returnForm.garmentTitle}
                    onChange={(e) => setReturnForm({ ...returnForm, garmentTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Reason for Request
                  </label>
                  <select
                    value={returnForm.reason}
                    onChange={(e: any) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs bg-white"
                  >
                    <option value="size_fit">Size / Fit Adjustment (Swap size)</option>
                    <option value="print_defect">Fabric or Print Defect</option>
                    <option value="wrong_item">Incorrect Item Handover</option>
                    <option value="fabric_feel">Fabric Feel Preference</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    Notes / Preferred Replacement Size
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Please specify your desired replacement size..."
                    value={returnForm.comments}
                    onChange={(e) => setReturnForm({ ...returnForm, comments: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div className="pt-3 border-t border-[#DDD3C5] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createReturnMutation.isPending}
                    className="h-10 px-5 rounded-xl bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-xs"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =======================================================
           ACCOUNT DELETION CONFIRMATION MODAL
      ======================================================= */}
      <AnimatePresence>
        {isDeleteAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white border border-red-300 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide">
                  <AlertTriangle size={18} />
                  <span>Confirm Account Deletion</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  className="text-[#6F6A63] hover:text-[#171717] p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                Are you sure you want to permanently delete your Bingooo account?
              </p>

              <ul className="text-xs text-[#6F6A63] space-y-1.5 list-disc pl-4">
                <li>Your profile and login credentials will be permanently erased.</li>
                <li>All saved shipping addresses will be removed.</li>
                <li>Active carts and wishlist items will be cleared.</li>
                <li>Order history will be anonymized for tax and statutory records.</li>
              </ul>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                ⚠️ This action cannot be undone.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  disabled={isDeletingAccount}
                  className="h-10 px-4 rounded-xl border border-[#DDD3C5] text-xs font-bold text-[#171717] hover:bg-[#F7EEDB]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs"
                >
                  {isDeletingAccount ? (
                    <>
                      <RotateCcw size={14} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default AccountPage;

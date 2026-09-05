import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useToast } from '../components/ui/Toast';

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Account Dashboard', icon: Home },
  { id: 'orders', label: 'My Orders', icon: Package, href: '/account/orders' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
  { id: 'addresses', label: 'My Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile Information', icon: User },
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'reviews', label: 'My Reviews', icon: Star },
];

export function AccountPage() {
  const shouldReduceMotion = useReducedMotion();
  const { user: authUser, logout, setUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [newsletterEmail, setNewsletterEmail] = useState('');

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

        {/* ─── Header: MY ACCOUNT ─── */}
        <div className="text-left pb-4 border-b border-[#DDD3C5]">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#171717] uppercase tracking-tight">
            MY ACCOUNT
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6F6A63] font-sans">
            Manage your profile, orders, saved addresses and preferences
          </p>
        </div>

        {/* ─── Two-Column Layout (Sidebar + Content) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Navigation Sidebar (4 cols on desktop, horizontal scrollable tab strip on mobile) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-2xl border border-[#DDD3C5] bg-white p-2 sm:p-3 shadow-xs flex lg:flex-col overflow-x-auto sm:overflow-visible gap-1 text-left no-scrollbar">
              {SIDEBAR_NAV.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeTab === nav.id;

                if (nav.href) {
                  return (
                    <motion.div key={nav.id} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to={nav.href}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-sans font-medium text-[#171717] hover:bg-[#F7EEDB]/60 hover:text-[#E6321C] transition-colors shrink-0 whitespace-nowrap"
                      >
                        <Icon size={15} className="text-[#6F6A63] shrink-0" />
                        <span>{nav.label}</span>
                      </Link>
                    </motion.div>
                  );
                }

                return (
                  <motion.button
                    key={nav.id}
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(nav.id)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-sans transition-colors shrink-0 whitespace-nowrap lg:w-full ${
                      isActive
                        ? 'bg-[#FDF0EE] text-[#E6321C] font-bold shadow-2xs'
                        : 'text-[#171717] hover:bg-[#F7EEDB]/60 hover:text-[#E6321C] font-medium'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-[#E6321C] shrink-0' : 'text-[#6F6A63] shrink-0'} />
                    <span>{nav.label}</span>
                  </motion.button>
                );
              })}

              {/* Logout Button */}
              <div className="pt-2 border-t border-[#DDD3C5]/60 mt-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold text-[#6F6A63] hover:text-[#E6321C] hover:bg-[#FDF0EE] transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <>
                {/* 1. Profile Overview Header Card */}
                <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[#F7EEDB] border border-[#DDD3C5] text-[#E6321C] font-heading font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-base sm:text-lg text-[#171717] flex items-center gap-1.5">
                        Hey, {displayName} <span>👋</span>
                      </h2>
                      <p className="text-xs text-[#6F6A63] font-sans mt-0.5">{displayEmail}</p>
                      <p className="text-xs text-[#6F6A63] font-sans mt-0.5">{displayPhone}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileForm({ fullName: displayName, phone: displayPhone });
                          setIsEditProfileOpen(true);
                        }}
                        className="mt-3 px-3 py-1 rounded-lg border border-[#DDD3C5] hover:border-[#E6321C] text-[#E6321C] font-sans font-bold text-[10px] uppercase tracking-wider transition-colors shadow-2xs"
                      >
                        EDIT PROFILE
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-auto grid grid-cols-3 gap-4 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#DDD3C5] md:pl-8 text-center sm:text-left">
                    <div>
                      <ShoppingBag size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                      <span className="text-[11px] font-sans text-[#6F6A63] block">Total Orders</span>
                      <span className="font-heading font-black text-2xl text-[#E6321C] block">{userOrders.length}</span>
                      <Link to="/account/orders" className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5">
                        View all orders
                      </Link>
                    </div>
                    <div>
                      <Heart size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                      <span className="text-[11px] font-sans text-[#6F6A63] block">Wishlist Items</span>
                      <span className="font-heading font-black text-2xl text-[#E6321C] block">{wishlist.length}</span>
                      <Link to="/account/wishlist" className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5">
                        View wishlist
                      </Link>
                    </div>
                    <div>
                      <MapPin size={18} className="text-[#6F6A63] mx-auto sm:mx-0 mb-1" />
                      <span className="text-[11px] font-sans text-[#6F6A63] block">Addresses</span>
                      <span className="font-heading font-black text-2xl text-[#E6321C] block">{addresses.length}</span>
                      <button onClick={() => setActiveTab('addresses')} className="text-[11px] text-[#E6321C] font-sans hover:underline block mt-0.5">
                        Manage addresses
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Recent Orders Card */}
                <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                    <h3 className="font-heading font-bold text-base text-[#171717]">Recent Orders</h3>
                    <Link to="/account/orders" className="inline-flex items-center gap-1 text-xs font-sans font-bold text-[#E6321C] hover:text-[#B91F12] transition-colors">
                      <span>View All Orders</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="divide-y divide-[#DDD3C5]/60">
                    {isOrdersLoading ? (
                      <div className="py-8 text-center text-xs text-muted">Loading recent orders...</div>
                    ) : userOrders.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-xs text-[#6F6A63] font-sans">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors">
                          <ShoppingBag size={13} />
                          <span>Explore Catalog</span>
                        </Link>
                      </div>
                    ) : (
                      userOrders.slice(0, 3).map((ord: any) => {
                        const firstItem = ord.items?.[0];
                        const itemCount = ord.items?.length || 1;
                        return (
                          <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="h-16 w-16 rounded-xl bg-[#F7EEDB]/60 border border-[#DDD3C5] flex items-center justify-center shrink-0">
                                <Shirt size={28} className="text-[#171717]/40" />
                              </div>
                              <div>
                                <h4 className="font-sans font-bold text-sm text-[#171717]">
                                  {firstItem?.title_snapshot || 'Bingooo Garment'}
                                  {itemCount > 1 ? ` + ${itemCount - 1} more` : ''}
                                </h4>
                                <p className="text-xs text-[#6F6A63] font-sans mt-0.5">
                                  {firstItem?.variant_snapshot_json?.size ? `Size ${firstItem.variant_snapshot_json.size} • ` : ''}
                                  Qty: {firstItem?.quantity || 1}
                                </p>
                                <p className="font-sans font-bold text-sm text-[#171717] mt-1">₹{ord.total}</p>
                                <span className="text-[11px] text-[#6F6A63] font-sans block mt-0.5 font-mono">
                                  Order: {ord.order_number}
                                </span>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                              <div className="text-right">
                                <span className="text-xs text-[#6F6A63] font-sans block">
                                  {new Date(ord.created_at).toLocaleDateString('en-IN')}
                                </span>
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase bg-brand-red/10 text-brand-red border border-brand-red/20">
                                  {ord.status?.replace('_', ' ')}
                                </span>
                              </div>
                              <Link to={`/account/orders/${ord.order_number}`} className="text-xs font-sans font-semibold text-[#E6321C] hover:underline">
                                View Details →
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Quick Actions */}
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-base text-[#171717]">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <button onClick={() => setActiveTab('addresses')} className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left">
                      <MapPin size={20} className="text-[#E6321C] mb-2" />
                      <h4 className="font-sans font-bold text-xs text-[#171717]">My Addresses</h4>
                      <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">Manage delivery destinations</p>
                    </button>
                    <button onClick={() => setActiveTab('profile')} className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left">
                      <User size={20} className="text-[#E6321C] mb-2" />
                      <h4 className="font-sans font-bold text-xs text-[#171717]">Profile Settings</h4>
                      <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">Edit email and phone</p>
                    </button>
                    <button onClick={() => setActiveTab('returns')} className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left">
                      <RotateCcw size={20} className="text-[#E6321C] mb-2" />
                      <h4 className="font-sans font-bold text-xs text-[#171717]">Returns & Refunds</h4>
                      <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">Request exchange or refund</p>
                    </button>
                    <button onClick={() => setActiveTab('reviews')} className="p-4 rounded-xl border border-[#DDD3C5] bg-white hover:border-[#E6321C] shadow-xs transition-colors block text-left">
                      <Star size={20} className="text-[#E6321C] mb-2" />
                      <h4 className="font-sans font-bold text-xs text-[#171717]">My Reviews</h4>
                      <p className="text-[11px] text-[#6F6A63] font-sans mt-0.5">View your submitted ratings</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB: PROFILE INFORMATION */}
            {activeTab === 'profile' && (
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="pb-3 border-b border-[#DDD3C5]">
                  <h3 className="font-heading font-bold text-lg text-[#171717]">Personal Information</h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Update your contact profile and account details</p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMutation.mutate({
                      fullName: profileForm.fullName || displayName,
                      phone: profileForm.phone || displayPhone,
                    });
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName || displayName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={displayEmail}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] bg-neutral-100 text-xs font-sans text-[#6F6A63] cursor-not-allowed"
                    />
                    <span className="text-[10px] text-[#6F6A63] block mt-1">Email address is permanently tied to account authentication.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone || displayPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: CHANGE PASSWORD */}
            {activeTab === 'password' && (
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="pb-3 border-b border-[#DDD3C5]">
                  <h3 className="font-heading font-bold text-lg text-[#171717]">Change Password</h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Ensure your account is using a strong password</p>
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
                    <label className="block text-xs font-bold text-[#171717] mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">New Password (Min 6 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors"
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#171717]">My Addresses</h3>
                    <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Manage delivery locations for checkout</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddAddressOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors shadow-2xs"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6F6A63]">No saved addresses found. Click Add Address to save your first shipping destination.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any) => (
                      <div key={addr.id} className="p-4 rounded-xl border border-[#DDD3C5] bg-[#FAF8F5] relative space-y-1.5">
                        {addr.is_default && (
                          <span className="inline-block mb-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E6321C]/10 text-[#E6321C]">
                            Default Address
                          </span>
                        )}
                        <h4 className="font-sans font-bold text-sm text-[#171717]">{addr.name}</h4>
                        <p className="text-xs text-[#6F6A63] font-sans">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-xs text-[#6F6A63] font-sans">{addr.city}, {addr.state} - {addr.postal_code}</p>
                        <p className="text-xs text-[#6F6A63] font-sans">Phone: {addr.phone}</p>
                        <div className="pt-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => deleteAddressMutation.mutate(addr.id)}
                            className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: RETURNS & REFUNDS */}
            {activeTab === 'returns' && (
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C5]">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-[#171717]">Returns & Refunds</h3>
                    <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Track return pickup statuses and refund authorizations</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E6321C] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors shadow-2xs"
                  >
                    <RotateCcw size={14} /> Request Return
                  </button>
                </div>

                {userReturns.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6F6A63]">No active return requests. Orders within 7 days of delivery are eligible for returns.</div>
                ) : (
                  <div className="divide-y divide-[#DDD3C5]/60">
                    {userReturns.map((ret: any) => (
                      <div key={ret.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-sans font-bold text-sm text-[#171717]">{ret.garment_title} (Size {ret.size})</h4>
                          <span className="text-xs text-[#6F6A63] font-sans block mt-0.5 font-mono">Order: {ret.order_number}</span>
                          <p className="text-xs text-[#6F6A63] font-sans mt-1">Reason: {ret.reason.replace('_', ' ')} • "{ret.comments}"</p>
                          <p className="text-xs font-bold text-[#171717] mt-1">Refund Amount: ₹{ret.refund_amount}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase bg-brand-red/10 text-brand-red border border-brand-red/20">
                            {ret.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-[#6F6A63] block mt-1">Requested {new Date(ret.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="rounded-2xl border border-[#DDD3C5] bg-white p-6 sm:p-7 shadow-xs space-y-6">
                <div className="pb-3 border-b border-[#DDD3C5]">
                  <h3 className="font-heading font-bold text-lg text-[#171717]">My Product Reviews</h3>
                  <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Ratings & feedback you submitted for Bingooo apparel</p>
                </div>
                {userReviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6F6A63]">You haven't written any reviews yet. Visit any product page to submit your rating!</div>
                ) : (
                  <div className="divide-y divide-[#DDD3C5]/60">
                    {userReviews.map((rev: any) => (
                      <div key={rev.id} className="py-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-sans font-bold text-sm text-[#171717]">{rev.product_title || 'Garment Review'}</h4>
                          <div className="flex items-center text-amber-500 text-xs">
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        {rev.title && <p className="text-xs font-bold text-[#171717]">{rev.title}</p>}
                        <p className="text-xs text-[#6F6A63] font-sans">{rev.body}</p>
                        <span className="text-[10px] text-[#6F6A63] block font-mono">Posted on {new Date(rev.created_at).toLocaleDateString()}</span>
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

        {/* ─── Stay in the loop! Newsletter Strip ─── */}
        <div className="rounded-2xl border border-[#DDD3C5] bg-[#F7EEDB] p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-left">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#E6321C] shrink-0 shadow-xs">
              <Mail size={22} className="stroke-[1.8]" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#171717]">Stay in the loop!</h3>
              <p className="text-xs text-[#6F6A63] font-sans mt-0.5">Get exclusive offers, new drops & style inspiration.</p>
            </div>
          </div>
          <form onSubmit={handleNewsletter} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs font-sans text-[#171717] focus:outline-none focus:border-[#E6321C]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E6321C] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#B91F12] transition-colors shrink-0 shadow-2xs"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-heading font-bold text-base text-[#171717]">Edit Profile Details</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-[#6F6A63] hover:text-[#171717]"><X size={18} /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate(profileForm);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] text-xs font-sans focus:outline-none focus:border-[#E6321C]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 rounded-xl border border-[#DDD3C5] text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={updateProfileMutation.isPending} className="px-4 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase">
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Add Address Modal ─── */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-heading font-bold text-base text-[#171717]">Add Shipping Address</h3>
                <button onClick={() => setIsAddAddressOpen(false)} className="text-[#6F6A63] hover:text-[#171717]"><X size={18} /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddressMutation.mutate(newAddressForm);
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.name}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddressForm.phone}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat, building, street"
                    value={newAddressForm.line1}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, line1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.state}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#171717] mb-1">PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddressForm.postalCode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, postalCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddAddressOpen(false)} className="px-4 py-2 rounded-xl border border-[#DDD3C5] text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={addAddressMutation.isPending} className="px-4 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase">Save Address</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Request Return Modal ─── */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#DDD3C5] pb-3">
                <h3 className="font-heading font-bold text-base text-[#171717]">Request Return / Exchange</h3>
                <button onClick={() => setIsReturnModalOpen(false)} className="text-[#6F6A63] hover:text-[#171717]"><X size={18} /></button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createReturnMutation.mutate(returnForm);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Order Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BING-89412"
                    value={returnForm.orderNumber}
                    onChange={(e) => setReturnForm({ ...returnForm, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Garment Name & Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Oversized Heavyweight Tee"
                    value={returnForm.garmentTitle}
                    onChange={(e) => setReturnForm({ ...returnForm, garmentTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Reason for Return</label>
                  <select
                    value={returnForm.reason}
                    onChange={(e: any) => setReturnForm({ ...returnForm, reason: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs bg-white"
                  >
                    <option value="size_fit">Size / Fit Issue (Too large or small)</option>
                    <option value="print_defect">Print / Fabric Defect</option>
                    <option value="wrong_item">Received Wrong Garment</option>
                    <option value="fabric_feel">Fabric Feel / GSM Not as Expected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">Comments / Notes</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Please describe why you would like to return or exchange..."
                    value={returnForm.comments}
                    onChange={(e) => setReturnForm({ ...returnForm, comments: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] text-xs"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsReturnModalOpen(false)} className="px-4 py-2 rounded-xl border border-[#DDD3C5] text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={createReturnMutation.isPending} className="px-4 py-2 rounded-xl bg-[#E6321C] text-white text-xs font-bold uppercase">Submit Request</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { adminLogin, loginAsDevAdmin } from '../lib/auth';

export function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Welcome Back', 'Signed in to Bingooo Atelier Console.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      setError(msg);
      toast.error('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = () => {
    loginAsDevAdmin();
    toast.success('Dev Access Granted', 'Signed in as Administrator.');
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#121212] text-white font-sans antialiased selection:bg-[#E6321C] selection:text-white">
      {/* =======================================================
           LEFT ATELIER OPERATIONS SHOWCASE (Desktop)
      ======================================================= */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 lg:p-16 border-r border-[#2B2825] overflow-hidden bg-[#121212]">
        {/* Background Workshop Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/custom-studio.jpg"
            alt="Bingooo atelier workshop production and logistics hub"
            className="w-full h-full object-cover opacity-25 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/90 to-[#121212]/95" />
        </div>

        {/* Top Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-[2px] text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#E6321C] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#E6321C]" />
            <span>ATELIER OS • CENTRAL COMMAND CONSOLE</span>
          </div>

          <div className="font-heading font-extrabold text-3xl tracking-tighter uppercase text-white">
            BINGOOO<span className="text-[#E6321C]">.</span>
          </div>
        </div>

        {/* Center Typography Narrative */}
        <div className="relative z-10 max-w-xl my-auto py-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8E8B85] mb-3">
            SRIKAKULAM WORKSHOP & FULFILLMENT MATRIX
          </div>

          <h1 className="text-[clamp(42px,5vw,78px)] font-extrabold leading-[0.88] tracking-[-0.065em] uppercase text-white mb-6">
            <span>ATELIER CONTROL.</span><br />
            <span>DISPATCH MATRIX.</span><br />
            <span className="text-[#E6321C]">CENTRAL COMMAND.</span>
          </h1>

          <p className="text-[#A09D96] text-sm leading-relaxed max-w-lg">
            High-density 240+ GSM inventory routing, on-demand DTF heat-press production queues, real-time Blue Dart / Delhivery courier handovers, and 24-hour customer reverse logistics.
          </p>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 grid grid-cols-4 gap-4 pt-8 border-t border-white/10">
          <div>
            <span className="font-mono text-xl font-extrabold text-white block">19,000+</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8B85] block mt-0.5">PINCODES</span>
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-[#E6321C] block">240–320</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8B85] block mt-0.5">GSM RUNS</span>
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-white block">99.98%</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8B85] block mt-0.5">DISPATCH SLA</span>
          </div>
          <div>
            <span className="font-mono text-xl font-extrabold text-[#238636] block">24H</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8E8B85] block mt-0.5">UPI REFUNDS</span>
          </div>
        </div>
      </section>

      {/* =======================================================
           RIGHT AUTHENTICATION COMMAND PANEL
      ======================================================= */}
      <section className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#181818]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="font-heading font-extrabold text-2xl tracking-tighter uppercase text-white">
            BINGOOO<span className="text-[#E6321C]">.</span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#E6321C] px-2 py-0.5 bg-white/5 border border-white/10 rounded-[2px]">
            ADMIN CONSOLE
          </div>
        </div>

        {/* Center Login Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 text-white/80 font-mono text-[9px] font-bold uppercase tracking-[0.2em] rounded-[2px] mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E6321C]" />
              <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2">
              Sign In to Atelier OS
            </h2>
            <p className="text-xs text-[#8E8B85] leading-relaxed">
              Enter verified staff credentials to manage catalog inventory, active customer orders, and reverse courier pickups.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-[2px] bg-[#E6321C]/10 border border-[#E6321C]/30 flex items-start gap-3 text-left">
              <AlertCircle className="w-4 h-4 text-[#E6321C] shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-[#E6321C] leading-snug">
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="admin-email"
                className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#A09D96] mb-1.5"
              >
                Staff Email Address
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bingooo.in"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-10 pr-4 rounded-[2px] border border-[#2B2825] bg-[#121212] text-xs font-mono text-white placeholder:text-[#555] outline-none focus:border-[#E6321C] focus:ring-1 focus:ring-[#E6321C] transition-all"
                />
                <Mail className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#A09D96] mb-1.5"
              >
                Access Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-10 rounded-[2px] border border-[#2B2825] bg-[#121212] text-xs font-mono text-white placeholder:text-[#555] outline-none focus:border-[#E6321C] focus:ring-1 focus:ring-[#E6321C] transition-all"
                />
                <Lock className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F6A63] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[2px] bg-[#E6321C] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#B91F12] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-6 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  <span>AUTHENTICATING ACCESS...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO ATELIER OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dev Quick Bypass Button */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleDevLogin}
              className="w-full py-2.5 px-4 rounded-[2px] bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#A09D96] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#E6321C]" />
              <span>[ DEV QUICK ACCESS: BYPASS CREDENTIALS ]</span>
            </button>
            <span className="text-[10px] text-[#555] font-mono block mt-2">
              Autologin with super-admin credentials for local inspection.
            </span>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-wider text-[#6F6A63]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
            <span>ENCRYPTED TLS 1.3 • HIGH SECURITY</span>
          </div>
          <div>BINGOOO ATELIER HQ • SRIKAKULAM, INDIA</div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;

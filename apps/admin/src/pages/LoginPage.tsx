import { useState, useEffect } from 'react';
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
import { adminLogin, adminGoogleLogin } from '../lib/auth';

export function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'unauthorized') {
      const msg = 'Access Denied: That Google account does not have Super Admin permissions.';
      setError(msg);
      toast.error('Unauthorized', msg);
    }
  }, [location.search, toast]);

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

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await adminGoogleLogin();
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed. Please verify your connection.';
      setError(msg);
      toast.error('Google Sign In Failed', msg);
      setGoogleLoading(false);
    }
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

          {/* OR Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#171717] px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6F6A63]">
              OR SIGN IN WITH
            </span>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-12 rounded-[2px] bg-white text-[#171717] hover:bg-[#EDE0CC] font-mono text-xs font-bold uppercase tracking-wider active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin text-[#171717]" />
                <span>CONNECTING WITH GOOGLE...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>LOGIN WITH GOOGLE</span>
              </>
            )}
          </button>
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

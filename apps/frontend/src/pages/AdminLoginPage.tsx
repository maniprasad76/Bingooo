import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Shield, Sparkles } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { signIn, loginAsDevAdmin } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'Welcome to Operations Console', variant: 'success' });
      navigate('/admin');
    } catch (err: any) {
      toast({
        title: 'Authentication failed',
        description: err.message || 'Please check your admin credentials.',
        variant: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = () => {
    loginAsDevAdmin();
    toast({
      title: 'Dev Admin Active',
      description: 'Authorized as local Super Admin for development.',
      variant: 'success',
    });
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#171717] p-4 text-white">
      <SEO
        title="Admin Console Login — Bingooo"
        description="Authorized access only for Bingooo store operators, catalog managers, and logistics team."
        noindex={true}
      />
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-[#1F1D1B] p-7 sm:p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Logo variant="white" size="lg" />
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#E6321C]">
            Operations & Control Panel
          </p>
          <p className="mt-2 text-xs text-white/55">
            Sign in with an authorized Bingooo administrator account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80">
              Admin Email
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bingooo.in"
                  className="w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E6321C] focus:outline-none focus:ring-1 focus:ring-[#E6321C]"
                />
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80">
              Password
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#E6321C] focus:outline-none focus:ring-1 focus:ring-[#E6321C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 flex items-center justify-center gap-2 rounded-md bg-[#E6321C] text-white text-xs font-semibold uppercase tracking-wide hover:bg-[#B91F12] transition-colors shadow-xs disabled:opacity-60"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In To Console'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Development Quick Bypass */}
        <div className="border-t border-white/10 pt-4 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-white/85">
              <Sparkles size={14} className="text-[#E6321C]" />
              Local Development Mode
            </p>
            <p className="mt-1 text-[11px] text-white/45">
              Quick credentials: <span className="font-mono text-white/70">admin@bingooo.in</span> /{' '}
              <span className="font-mono text-white/70">Admin@123456</span>
            </p>
            <button
              type="button"
              onClick={handleDevBypass}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2 text-xs font-bold text-white transition-all hover:bg-white/20"
            >
              <Shield size={14} className="text-[#E6321C]" /> Enter as Dev Admin
            </button>
          </div>
        </div>

        {/* Back to storefront */}
        <div className="text-center pt-1">
          <Link
            to="/"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            ← Return to Bingooo Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

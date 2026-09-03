import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Crown, Sparkles, Shield } from 'lucide-react';
import { signIn, loginAsDevAdmin } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'Welcome back, Admin', variant: 'success' });
      navigate('/');
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
      title: 'Dev Admin Bypass Active',
      description: 'Authorized as local Super Admin for development.',
      variant: 'success',
    });
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#171717] p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-[#1F1D1B] p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red text-white shadow-lg shadow-brand-red/30">
            <Crown size={28} />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            BINGOOO<span className="text-brand-red">.</span>
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-red">
            Operations & Control Panel
          </p>
          <p className="mt-2 text-xs text-white/50">
            Sign in with an authorized Bingooo administrator account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70">
              Admin Email
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bingooo.in"
                  className="w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70">
              Password
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/15 bg-white/5 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In To Console'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Development Quick Bypass */}
        <div className="border-t border-white/10 pt-5 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-white/80">
              <Sparkles size={14} className="text-brand-red" />
              Local Development Mode
            </p>
            <p className="mt-1 text-[11px] text-white/45">
              Instantly bypass credentials with a local Super Admin session.
            </p>
            <button
              type="button"
              onClick={handleDevBypass}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20"
            >
              <Shield size={14} className="text-brand-red" /> Enter as Dev Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

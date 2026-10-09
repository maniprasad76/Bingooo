import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { GoogleIcon, FacebookIcon } from '../components/ui/SocialIcons';
import { signIn, signInWithProvider } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // If user was bounced from protected page, return there
  const from = (location.state as { from?: { pathname?: string; search?: string } })?.from;
  const redirectTo = from?.pathname ? `${from.pathname}${from.search || ''}` : '/account';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast({ title: 'Welcome back', variant: 'success' });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast({
        title: 'Unable to sign in',
        description: error instanceof Error ? error.message : 'Please check your email and password.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      if (redirectTo) {
        sessionStorage.setItem('bingooo_auth_redirect', redirectTo);
      }
      await signInWithProvider(provider, `${window.location.origin}/auth/callback`);
    } catch (error) {
      toast({
        title: `${provider === 'google' ? 'Google' : 'Facebook'} Sign-In`,
        description: error instanceof Error ? error.message : 'Authentication was cancelled or failed.',
        variant: 'danger',
      });
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-6 sm:py-10">
      <SEO
        title="Sign In"
        description="Sign in to your Bingooo account to manage your profile, view orders, and access saved 240 GSM custom designs."
        noindex={true}
      />
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-[430px] bg-white rounded-[2px] border-2 border-[#171717] shadow-[6px_6px_0px_#171717] overflow-hidden"
      >
        {/* Top Brand Accent Bar */}
        <div className="border-b-2 border-[#171717] bg-[#EDE0CC] px-4 py-2 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-widest text-[#171717]">
          <span>01 // ACCESS TERMINAL</span>
          <span className="flex items-center gap-1.5 text-[#E6321C]">
            <span className="w-2 h-2 rounded-full bg-[#E6321C] animate-pulse" />
            SECURE
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="text-center mb-5 flex flex-col items-center">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Logo variant="red" size="md" withLink className="mb-2.5" />
            </motion.div>
            <h1 className="font-heading text-2xl sm:text-[26px] font-black uppercase tracking-tight text-[#171717] leading-tight">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#6F6A63]">
              Sign in to manage your orders & bespoke designs
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialSignIn('google')}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[2px] border-2 border-[#171717] bg-white text-xs font-black uppercase tracking-wider text-[#171717] hover:bg-[#F7EEDB] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed shadow-[2px_2px_0px_#171717]"
            >
              {socialLoading === 'google' ? (
                <div className="h-4 w-4 rounded-full border-2 border-[#171717] border-t-transparent animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialSignIn('facebook')}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[2px] border-2 border-[#171717] bg-white text-xs font-black uppercase tracking-wider text-[#171717] hover:bg-[#F7EEDB] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed shadow-[2px_2px_0px_#171717]"
            >
              {socialLoading === 'facebook' ? (
                <div className="h-4 w-4 rounded-full border-2 border-[#1877F2] border-t-transparent animate-spin" />
              ) : (
                <FacebookIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t-2 border-[#171717]" />
            <span className="absolute bg-white px-2.5 border border-[#171717] text-[10px] font-mono font-black uppercase tracking-wider text-[#171717] shadow-[1px_1px_0px_#171717]">
              or email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#171717] hover:text-[#E6321C] focus:outline-none p-1 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#171717] font-bold">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-[2px] border-2 border-[#171717] text-[#E6321C] focus:ring-0 cursor-pointer accent-[#E6321C]"
                  {...register('rememberMe')}
                />
                <span className="text-[11px] font-mono uppercase">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-mono text-[11px] font-bold text-[#6F6A63] hover:text-[#E6321C] transition-colors uppercase tracking-wider"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="md"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs font-medium text-[#6F6A63]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#E6321C] font-black uppercase tracking-wider hover:underline">
              Create an account
            </Link>
          </p>

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t-2 border-[#171717] flex items-center justify-center gap-2 text-[11px] font-mono uppercase font-bold text-[#6F6A63]">
            <ShieldCheck size={14} className="text-[#238636] shrink-0" />
            <span>256-bit encrypted secure authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { m, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { GoogleIcon, FacebookIcon } from '../components/ui/SocialIcons';
import { signUp, signInWithProvider } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms and Privacy Policy',
  }),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms: true,
    },
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast({
        title: 'Account created successfully',
        description: 'Welcome to the Bingooo community.',
        variant: 'success',
      });
      navigate('/account');
    } catch (error) {
      toast({
        title: 'Unable to create account',
        description: error instanceof Error ? error.message : 'Please check your information and try again.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      sessionStorage.setItem('bingooo_auth_redirect', '/account');
      await signInWithProvider(provider, `${window.location.origin}/auth/callback`);
    } catch (error) {
      toast({
        title: `${provider === 'google' ? 'Google' : 'Facebook'} Registration`,
        description: error instanceof Error ? error.message : 'Authentication was cancelled or failed.',
        variant: 'danger',
      });
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-6 sm:py-10">
      <SEO
        title="Create Account"
        description="Join Bingooo for exclusive access to heavyweight menswear drops, saved custom studio drafts, and expedited checkout."
        noindex={true}
      />
      <m.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-[440px] bg-white rounded-[2px] border-2 border-[#171717] shadow-[6px_6px_0px_#171717] overflow-hidden"
      >
        {/* Top Brand Accent Bar */}
        <div className="border-b-2 border-[#171717] bg-[#EDE0CC] px-4 py-2 flex items-center justify-between font-mono text-[9px] font-black uppercase tracking-widest text-[#171717]">
          <span>01 // ATELIER REGISTRATION</span>
          <span className="flex items-center gap-1.5 text-[#E6321C]">
            <span className="w-2 h-2 rounded-full bg-[#E6321C] animate-pulse" />
            LIVE
          </span>
        </div>

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="text-center mb-5 flex flex-col items-center">
            <m.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Logo variant="red" size="md" withLink className="mb-2.5" />
            </m.div>
            <h1 className="font-heading text-2xl sm:text-[26px] font-black uppercase tracking-tight text-[#171717] leading-tight">
              Create Account
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#6F6A63]">
              Join Bingooo for bespoke custom drops & fast checkout
            </p>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialSignUp('google')}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[2px] border-2 border-[#171717] bg-white text-xs font-black uppercase tracking-wider text-[#171717] hover:bg-[#F7EEDB] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed shadow-[2px_2px_0px_#171717]"
            >
              {socialLoading === 'google' ? (
                <div className="h-4 w-4 rounded-full border-2 border-[#171717] border-t-transparent animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Sign up with Google</span>
            </button>

            <button
              type="button"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialSignUp('facebook')}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-[2px] border-2 border-[#171717] bg-white text-xs font-black uppercase tracking-wider text-[#171717] hover:bg-[#F7EEDB] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed shadow-[2px_2px_0px_#171717]"
            >
              {socialLoading === 'facebook' ? (
                <div className="h-4 w-4 rounded-full border-2 border-[#1877F2] border-t-transparent animate-spin" />
              ) : (
                <FacebookIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Sign up with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t-2 border-[#171717]" />
            <span className="absolute bg-white px-2.5 border border-[#171717] text-[10px] font-mono font-black uppercase tracking-wider text-[#171717] shadow-[1px_1px_0px_#171717]">
              or register
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <Input
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Arjun Sharma"
              leftIcon={<User size={16} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
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
              hint="Must contain at least 8 characters"
              {...register('password')}
            />

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#171717] font-medium leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded-[2px] border-2 border-[#171717] text-[#E6321C] focus:ring-0 cursor-pointer accent-[#E6321C] shrink-0"
                  {...register('terms')}
                />
                <span>
                  I agree to Bingooo's{' '}
                  <Link to="/terms" className="text-[#171717] underline font-bold hover:text-[#E6321C]">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-[#171717] underline font-bold hover:text-[#E6321C]">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 font-mono text-[10px] uppercase font-bold text-[#E6321C]" role="alert">
                  {errors.terms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs font-medium text-[#6F6A63]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E6321C] font-black uppercase tracking-wider hover:underline">
              Sign In
            </Link>
          </p>

          {/* Trust / Guarantee note */}
          <div className="mt-6 pt-5 border-t-2 border-[#171717] flex items-center justify-center gap-2 text-[11px] font-mono uppercase font-bold text-[#6F6A63]">
            <ShieldCheck size={14} className="text-[#238636] shrink-0" />
            <span>Encrypted data & verified privacy protection</span>
          </div>
        </div>
      </m.div>
    </div>
  );
}

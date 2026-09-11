import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
      await signInWithProvider(provider, `${window.location.origin}/account`);
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
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-[440px] bg-white rounded-2xl border border-[#DDD3C5] shadow-card overflow-hidden"
      >
        {/* Top Brand Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#E6321C] via-[#B91F12] to-[#E6321C]" />

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="text-center mb-5 flex flex-col items-center">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Logo variant="red" size="md" withLink className="mb-2.5" />
            </motion.div>
            <h1 className="font-heading text-2xl sm:text-[26px] font-extrabold uppercase tracking-tight text-[#171717] leading-tight">
              Create Account
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63]">
              Join Bingooo for bespoke custom drops & fast checkout
            </p>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={socialLoading !== null || loading}
              onClick={() => handleSocialSignUp('google')}
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-lg border border-[#DDD3C5] bg-white text-xs sm:text-sm font-semibold text-[#171717] hover:bg-[#F7EEDB]/30 hover:border-[#171717] transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
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
              className="w-full flex items-center justify-center gap-3 h-10 px-4 rounded-lg border border-[#DDD3C5] bg-white text-xs sm:text-sm font-semibold text-[#171717] hover:bg-[#F7EEDB]/30 hover:border-[#1877F2] transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
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
            <div className="w-full border-t border-[#DDD3C5]" />
            <span className="absolute bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-[#6F6A63]">
              or register with email
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
                  className="text-muted hover:text-ink focus:outline-none p-1 transition-colors"
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
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#6F6A63] leading-relaxed">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[#DDD3C5] text-[#E6321C] focus:ring-[#E6321C] cursor-pointer accent-[#E6321C] shrink-0"
                  {...register('terms')}
                />
                <span>
                  I agree to Bingooo's{' '}
                  <Link to="/terms" className="text-[#171717] underline hover:text-[#E6321C]">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="text-[#171717] underline hover:text-[#E6321C]">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-caption text-danger" role="alert">
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
          <p className="mt-6 text-center text-xs text-[#6F6A63]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E6321C] font-bold hover:underline">
              Sign In
            </Link>
          </p>

          {/* Trust / Guarantee note */}
          <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60 flex items-center justify-center gap-2 text-[11px] text-[#6F6A63]">
            <ShieldCheck size={14} className="text-[#238636] shrink-0" />
            <span>Encrypted data & verified privacy protection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

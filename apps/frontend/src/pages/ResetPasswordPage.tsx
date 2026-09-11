import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { confirmPasswordReset } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

const resetSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const shouldReduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const queryEmail = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: queryEmail,
    },
  });

  const onSubmit = async (data: ResetForm) => {
    setLoading(true);
    try {
      await confirmPasswordReset(data.email, data.password);
      setIsSuccess(true);
      toast({
        title: 'Password updated successfully',
        description: 'You can now sign in with your new password.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Failed to reset password',
        description: error instanceof Error ? error.message : 'Please request a new reset link.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16">
      <SEO
        title="Set New Password"
        description="Choose a secure new password for your Bingooo account."
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

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 flex flex-col items-center">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400 }}>
              <Logo variant="red" size="md" withLink className="mb-3" />
            </motion.div>
            <h1 className="font-heading text-2xl sm:text-[28px] font-extrabold uppercase tracking-tight text-[#171717] leading-tight">
              New Password
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63]">
              Create a secure password with at least 8 characters
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center py-2"
            >
              <div className="w-14 h-14 rounded-full bg-[#238636]/10 text-[#238636] flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="text-lg font-bold text-ink">Password Changed</h2>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed max-w-xs">
                Your account password has been updated. You can now sign in to your Bingooo account.
              </p>

              <div className="mt-6 flex flex-col w-full gap-3">
                <Button
                  fullWidth
                  size="md"
                  onClick={() => navigate('/login')}
                  className=""
                >
                  Sign In Now
                </Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="New Password"
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
                hint="Minimum 8 characters"
                {...register('password')}
              />

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                leftIcon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted hover:text-ink focus:outline-none p-1 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                size="md"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                Update Password
              </Button>
            </form>
          )}

          {/* Footer link */}
          {!isSuccess && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#6F6A63] hover:text-[#E6321C] transition-colors"
              >
                Remember your password? Sign In
              </Link>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60 flex items-center justify-center gap-2 text-[11px] text-[#6F6A63]">
            <ShieldCheck size={14} className="text-[#238636] shrink-0" />
            <span>256-bit encrypted password hashing & protection</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

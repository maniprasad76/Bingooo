import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { requestPasswordReset } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await requestPasswordReset(data.email);
      setSubmittedEmail(data.email);
      toast({
        title: 'Reset instructions sent',
        description: 'Please check your email inbox.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Unable to send reset email',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16">
      <SEO
        title="Forgot Password"
        description="Reset your Bingooo account password safely and regain access to your orders and designs."
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
              Reset Password
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6F6A63]">
              Enter your email and we'll send you recovery instructions
            </p>
          </div>

          {submittedEmail ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center flex flex-col items-center py-2"
            >
              <div className="w-14 h-14 rounded-full bg-[#238636]/10 text-[#238636] flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>

              <h2 className="text-lg font-bold text-ink">Instructions Sent</h2>
              <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed max-w-xs">
                We've sent password reset instructions to{' '}
                <span className="font-semibold text-ink">{submittedEmail}</span>.
              </p>
              <p className="mt-2 text-xs text-muted">
                Didn't receive the email? Check your spam folder or try resending.
              </p>

              <div className="mt-6 flex flex-col w-full gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setSubmittedEmail(null)}
                >
                  Try Another Email
                </Button>
                <Link to="/login" className="w-full">
                  <Button variant="ghost" fullWidth className="gap-2">
                    <ArrowLeft size={16} /> Back to Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={16} />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  size="md"
                  fullWidth
                  loading={loading}
                  className="mt-2"
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6A63] hover:text-[#E6321C] transition-colors"
                >
                  <ArrowLeft size={15} /> Back to Sign In
                </Link>
              </div>
            </>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-[#DDD3C5]/60 flex items-center justify-center gap-2 text-[11px] text-[#6F6A63]">
            <ShieldCheck size={14} className="text-[#238636] shrink-0" />
            <span>Secure account verification powered by Bingooo</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

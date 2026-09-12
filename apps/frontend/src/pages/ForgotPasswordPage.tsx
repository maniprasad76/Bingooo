import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { requestPasswordReset } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
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
    triggerHaptic('medium');
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
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-[calc(100vh-104px)] flex flex-col justify-center py-8 sm:py-16">
      <SEO
        title="Forgot Password — BINGOOO"
        description="Reset your Bingooo account password safely and regain access to your orders and bespoke designs."
        noindex={true}
      />

      <div className="container-bingooo">
        <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden border border-[#ddd3c5] bg-white shadow-sm">
          {/* Editorial Visual Column (Inspired by HomePage / AboutPage) */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 bg-[#171717] text-white overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90"
                alt="Bingooo Atelier"
                className="h-full w-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#e6321c] font-mono mb-2">
                ACCOUNT RECOVERY
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-white">
                REGAIN<br />
                YOUR<br />
                <span className="text-[#e6321c]">ACCESS.</span>
              </h2>
            </div>

            <div className="relative z-10 space-y-4 pt-12">
              <p className="text-xs text-[#c7c3bd] leading-relaxed max-w-[280px]">
                Enter your registered email. We will send a secure link to reset your credentials and access your saved fits.
              </p>
              <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-[#aaaaaa]">
                BINGOOO ATELIER &bull; EST. 2026
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#faf8f5]">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Logo variant="red" size="sm" />
                <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#6f6a63] pl-2 border-l border-[#ddd3c5]">
                  SECURITY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
                RESET PASSWORD
              </h1>
              <p className="mt-1 text-xs text-[#6f6a63] leading-relaxed">
                Enter your email address and we'll send you recovery instructions.
              </p>
            </div>

            {submittedEmail ? (
              <div className="p-6 border border-[#ddd3c5] bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#238636]/10 text-[#238636] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                    Instructions Dispatched
                  </h3>
                  <p className="mt-1 text-xs text-[#6f6a63] leading-relaxed">
                    We sent password reset instructions to <strong className="text-[#171717]">{submittedEmail}</strong>.
                  </p>
                  <p className="mt-2 text-[11px] text-[#6f6a63]">
                    Please check your inbox or spam folder within the next few minutes.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSubmittedEmail(null);
                    }}
                    className="flex-1 py-3 px-4 border border-[#171717] text-[#171717] text-[10px] font-bold uppercase tracking-wider hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
                  >
                    Try Another Email
                  </button>
                  <Link
                    to="/login"
                    onClick={() => triggerHaptic('light')}
                    className="flex-1 py-3 px-4 bg-[#171717] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors text-center inline-flex items-center justify-center gap-1"
                  >
                    <span>Back to Login</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#171717] mb-1.5">
                    REGISTERED EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="e.g. yourname@gmail.com"
                      {...register('email')}
                      className="w-full h-12 px-3.5 bg-white border border-[#ddd3c5] text-xs text-[#171717] placeholder:text-[#999] outline-none focus:border-[#171717] transition-colors rounded-none"
                    />
                    <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6a63] pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] font-medium text-[#e6321c]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => triggerHaptic('light')}
                  className="w-full h-12 bg-[#171717] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#e6321c] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span>DISPATCHING...</span>
                  ) : (
                    <>
                      <span>SEND RECOVERY LINK</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-4 border-t border-[#ddd3c5]/70 text-xs">
                  <Link
                    to="/login"
                    onClick={() => triggerHaptic('light')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6f6a63] hover:text-[#e6321c] transition-colors"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Sign In</span>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => triggerHaptic('light')}
                    className="text-[11px] text-[#6f6a63] hover:text-[#171717] transition-colors"
                  >
                    Need Help?
                  </Link>
                </div>
              </form>
            )}

            {/* Trust Assurance */}
            <div className="mt-8 pt-4 border-t border-[#ddd3c5]/50 flex items-center gap-2 text-[10px] text-[#6f6a63]">
              <ShieldCheck size={14} className="text-[#238636] shrink-0" />
              <span>Bingooo encrypted account security &bull; Srikakulam Atelier</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

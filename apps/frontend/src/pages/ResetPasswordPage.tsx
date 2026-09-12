import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Eye, EyeOff, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { confirmPasswordReset } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { triggerHaptic } from '../lib/native/capacitorBridge';

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
    triggerHaptic('medium');
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
    <main className="bg-[#f7eedb] text-[#171717] font-sans antialiased min-h-[calc(100vh-104px)] flex flex-col justify-center py-8 sm:py-16">
      <SEO
        title="Set New Password — BINGOOO"
        description="Choose a secure new password for your Bingooo account."
        noindex={true}
      />

      <div className="container-bingooo">
        <div className="max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden border border-[#ddd3c5] bg-white shadow-sm">
          {/* Editorial Visual Column */}
          <div className="relative hidden lg:flex flex-col justify-between p-10 bg-[#171717] text-white overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <img
                src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90"
                alt="Bingooo Security"
                className="h-full w-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#e6321c] font-mono mb-2">
                ACCOUNT INTEGRITY
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-white">
                PROTECT<br />
                YOUR<br />
                <span className="text-[#e6321c]">ATELIER.</span>
              </h2>
            </div>

            <div className="relative z-10 space-y-4 pt-12">
              <p className="text-xs text-[#c7c3bd] leading-relaxed max-w-[280px]">
                Create a strong, unique password with at least 8 characters to safeguard your customized graphics, orders, and saved addresses.
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
                  NEW CREDENTIALS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#171717]">
                SET NEW PASSWORD
              </h1>
              <p className="mt-1 text-xs text-[#6f6a63] leading-relaxed">
                Choose a strong password of at least 8 characters.
              </p>
            </div>

            {isSuccess ? (
              <div className="p-6 border border-[#ddd3c5] bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#238636]/10 text-[#238636] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#171717]">
                    Password Updated
                  </h3>
                  <p className="mt-1 text-xs text-[#6f6a63] leading-relaxed">
                    Your account password has been successfully updated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    navigate('/login');
                  }}
                  className="w-full h-12 bg-[#171717] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SIGN IN NOW</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#171717] mb-1">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
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

                <div>
                  <label htmlFor="password" className="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#171717] mb-1">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      {...register('password')}
                      className="w-full h-12 px-3.5 pr-10 bg-white border border-[#ddd3c5] text-xs text-[#171717] placeholder:text-[#999] outline-none focus:border-[#171717] transition-colors rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6a63] hover:text-[#171717] p-1 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[11px] font-medium text-[#e6321c]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#171717] mb-1">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      {...register('confirmPassword')}
                      className="w-full h-12 px-3.5 pr-10 bg-white border border-[#ddd3c5] text-xs text-[#171717] placeholder:text-[#999] outline-none focus:border-[#171717] transition-colors rounded-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f6a63] hover:text-[#171717] p-1 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-[11px] font-medium text-[#e6321c]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => triggerHaptic('light')}
                  className="w-full h-12 bg-[#171717] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#e6321c] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <span>UPDATING...</span>
                  ) : (
                    <>
                      <span>UPDATE PASSWORD</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                <div className="pt-3 text-center">
                  <Link
                    to="/login"
                    onClick={() => triggerHaptic('light')}
                    className="text-xs font-semibold text-[#6f6a63] hover:text-[#e6321c] transition-colors"
                  >
                    Remember your password? Sign In →
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-8 pt-4 border-t border-[#ddd3c5]/50 flex items-center gap-2 text-[10px] text-[#6f6a63]">
              <ShieldCheck size={14} className="text-[#238636] shrink-0" />
              <span>256-bit encrypted password hashing & protection</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

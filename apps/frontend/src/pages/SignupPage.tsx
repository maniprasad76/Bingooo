import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { signUp } from '../lib/auth/supabase';
import { useToast } from '../components/ui/Toast';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.fullName);
      toast({
        title: 'Account created',
        description: 'Check your inbox if email confirmation is enabled.',
        variant: 'success',
      });
      navigate('/account');
    } catch (error) {
      toast({
        title: 'Unable to create account',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-sm p-6 sm:p-8 bg-white rounded-2xl border border-[#DDD3C5] shadow-xs"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Logo variant="red" size="lg" withLink className="mb-4" />
          </motion.div>
          <h1 className="text-display-lg text-ink">Create Account</h1>
          <p className="mt-2 text-body text-muted">Join Bingooo and start shopping</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="Your name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" fullWidth loading={loading} className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-caption text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

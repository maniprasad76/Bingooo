import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    // TODO: call signUp(data.email, data.password, data.fullName)
    console.log('Signup:', data);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="red" size="lg" withLink className="mb-4" />
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
      </div>
    </div>
  );
}

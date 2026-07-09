// components/register-form.tsx
// Credentials Sign Up Form. Integrates React Hook Form, Zod, and Better Auth.

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { registerSchema, RegisterInput } from '@/schemas/register.schema';
import { authClient } from '@/lib/auth-client';
import { PasswordInput } from './password-input';
import { SubmitButton } from './submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/dashboard',
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || 'Registration failed');
        },
        onSuccess: () => {
          toast.success('Account created successfully!');
          router.push('/dashboard');
          router.refresh();
        }
      });
    } catch (err: any) {
      toast.error('An unexpected connection error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          disabled={loading}
          className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          disabled={loading}
          className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          disabled={loading}
          className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          disabled={loading}
          className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <SubmitButton loading={loading} className="w-full mt-2">
        Create Account
      </SubmitButton>
    </form>
  );
}

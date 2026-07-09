// components/login-form.tsx
// Credentials Sign In Form. Integrates React Hook Form, Zod, and Better Auth.

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { loginSchema, LoginInput } from '@/schemas/login.schema';
import { authClient } from '@/lib/auth-client';
import { PasswordInput } from './password-input';
import { SubmitButton } from './submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: callbackUrl,
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onResponse: () => {
          setLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || 'Invalid email or password');
        },
        onSuccess: () => {
          toast.success('Logged in successfully!');
          router.push(callbackUrl);
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
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

      <SubmitButton loading={loading} className="w-full mt-2">
        Sign In
      </SubmitButton>
    </form>
  );
}

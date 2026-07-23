// components/register-form.tsx
// Credentials Sign Up Form (Luxury 28px aesthetic with 56px pill buttons).

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { registerSchema, RegisterInput } from '@/schemas/register.schema';
import { authClient } from '@/lib/auth-client';
import { PasswordInput } from './password-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);

  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl') || '/dashboard';

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
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result?.error) {
        toast.error(result.error.message || 'Registration failed');
        setLoading(false);
        return;
      }

      toast.success('Account created successfully! Redirecting...');
      // Hard redirect ensures the session cookie is picked up by middleware
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error('An unexpected connection error occurred');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err: any) {
      toast.error(err?.message || 'Google Sign In failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Full name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          disabled={loading}
          className={`h-11 rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A] ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          disabled={loading}
          className={`h-11 rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A] ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Password</Label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          disabled={loading}
          className={`h-11 rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A] ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          disabled={loading}
          className={`h-11 rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A] ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary-luxury w-full mt-2"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[rgba(255,170,80,0.2)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
          <span className="bg-white px-3 text-[#8A8A8A]">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="btn-secondary-luxury w-full flex items-center justify-center gap-3"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </button>
    </form>
  );
}

// app/auth/sign-in/page.tsx
// Credentials Sign In Page View (Luxury warm aesthetic).

import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { LoginForm } from '@/components/login-form';

export const metadata = {
  title: 'Sign In — PhotoShare AI',
  description: 'Sign in to access your event photo galleries.',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-4 relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] hero-radial-glow pointer-events-none" />

      <AuthCard
        title="Welcome Back"
        description="Enter your email to sign in to your event photo space"
        footer={
          <span className="text-[#8A8A8A]">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-bold text-[#FB8500] hover:underline"
            >
              Sign up
            </Link>
          </span>
        }
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}

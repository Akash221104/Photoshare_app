// app/auth/sign-in/page.tsx
// Credentials Sign In Page View.

import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { LoginForm } from '@/components/login-form';

export const metadata = {
  title: 'Sign In — AI Event Photo Share',
  description: 'Sign in to access your event photo galleries.',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <AuthCard
        title="Welcome Back"
        description="Enter your email to sign in to your account"
        footer={
          <span className="text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
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

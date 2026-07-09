// app/auth/sign-up/page.tsx
// Credentials Sign Up Page View.

import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { RegisterForm } from '@/components/register-form';

export const metadata = {
  title: 'Sign Up — AI Event Photo Share',
  description: 'Create an account to join and upload photos to events.',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <AuthCard
        title="Create an Account"
        description="Fill out the form below to get started"
        footer={
          <span className="text-zinc-500">
            Already have an account?{' '}
            <Link
              href="/auth/sign-in"
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            >
              Sign in
            </Link>
          </span>
        }
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}

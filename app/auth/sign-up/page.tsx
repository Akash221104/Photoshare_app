// app/auth/sign-up/page.tsx
// Credentials Sign Up Page View (Luxury warm aesthetic).

import Link from 'next/link';
import { AuthCard } from '@/components/auth-card';
import { RegisterForm } from '@/components/register-form';

export const metadata = {
  title: 'Sign Up — PhotoShare AI',
  description: 'Create an account to start sharing event galleries.',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-4 relative overflow-hidden py-12">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] hero-radial-glow pointer-events-none" />

      <AuthCard
        title="Create Account"
        description="Get started with AI private photo sharing for your events"
        footer={
          <span className="text-[#8A8A8A]">
            Already have an account?{' '}
            <Link
              href="/auth/sign-in"
              className="font-bold text-[#FB8500] hover:underline"
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

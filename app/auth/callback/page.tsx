// app/auth/callback/page.tsx
// OAuth Redirect Callback Handler.
// Catches all OAuth return redirects (e.g., Google login) and redirects smoothly to /dashboard.

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    // Check session or redirect directly to dashboard
    const timer = setTimeout(() => {
      window.location.href = callbackUrl;
    }, 1000);

    return () => clearTimeout(timer);
  }, [callbackUrl, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-zinc-900 dark:text-zinc-50" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Completing sign in...
        </h2>
        <p className="text-sm text-zinc-500">
          Please wait while we redirect you to your workspace.
        </p>
      </div>
    </div>
  );
}

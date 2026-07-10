// hooks/useAuth.ts
// React hook for authentication controls: session status, sign-out.
// Uses @neondatabase/auth/next via authClient.

'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useCurrentUser } from './useCurrentUser';

export function useAuth() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const handleSignOut = async () => {
    try {
      const result = await authClient.signOut();
      if (result?.error) {
        toast.error(result.error.message || 'Logout failed');
        return;
      }
      toast.success('Logged out successfully');
      // Hard redirect to clear session state fully
      window.location.href = '/auth/sign-in';
    } catch (error) {
      toast.error('An unexpected error occurred during logout');
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    signOut: handleSignOut,
  };
}

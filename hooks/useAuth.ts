// hooks/useAuth.ts
// React Hook for client-side authentication controls (session status, logout triggers).

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useCurrentUser } from './useCurrentUser';

export function useAuth() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Logged out successfully');
            router.push('/auth/sign-in');
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Logout failed');
          },
        },
      });
    } catch (error) {
      toast.error('An unexpected connection error occurred during logout');
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    signOut: handleSignOut,
  };
}

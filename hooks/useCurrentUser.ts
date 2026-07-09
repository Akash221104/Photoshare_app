// hooks/useCurrentUser.ts
// React Hook to access the currently logged-in user from the client side.

import { authClient } from '@/lib/auth-client';
import { User } from '@/types/auth';

export function useCurrentUser(): {
  user: User | null;
  loading: boolean;
  error: Error | null;
} {
  const { data: sessionData, isPending: loading, error } = authClient.useSession();

  const user = sessionData?.user
    ? ({
        id: sessionData.user.id,
        name: sessionData.user.name,
        email: sessionData.user.email,
        emailVerified: sessionData.user.emailVerified,
        image: sessionData.user.image,
        createdAt: new Date(sessionData.user.createdAt),
        updatedAt: new Date(sessionData.user.updatedAt),
      } as User)
    : null;

  return {
    user,
    loading,
    error: error ? new Error(error.statusText || 'Failed to fetch session') : null,
  };
}

// hooks/useCurrentUser.ts
// React hook to access the currently signed-in user from Neon Auth.
// Uses authClient.useSession() from @neondatabase/auth/next.

'use client';

import { authClient } from '@/lib/auth-client';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function useCurrentUser(): {
  user: CurrentUser | null;
  loading: boolean;
  error: Error | null;
} {
  const { data: session, isPending: loading, error } = authClient.useSession();

  const user: CurrentUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        image: session.user.image ?? null,
        createdAt: new Date(session.user.createdAt),
        updatedAt: new Date(session.user.updatedAt),
      }
    : null;

  return {
    user,
    loading,
    error: error ? new Error(String(error)) : null,
  };
}

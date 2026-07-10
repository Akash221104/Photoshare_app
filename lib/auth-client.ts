// lib/auth-client.ts
// Better Auth Client hook setup for React components.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Since frontend and backend share the same domain, we can dynamically detect the baseURL.
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});

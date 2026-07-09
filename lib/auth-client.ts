// lib/auth-client.ts
// Better Auth Client hook setup for React components.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL can be omitted if frontend and backend share domain. 
  // We specify it fallback to localhost:3000.
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

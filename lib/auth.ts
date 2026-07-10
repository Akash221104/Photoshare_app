// lib/auth.ts
// Neon Auth Server Instance — single source of truth for all server-side auth.
// Uses @neondatabase/auth/next/server exclusively.

import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

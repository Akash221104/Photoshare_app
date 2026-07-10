// lib/auth.ts
// Neon Auth Server Instance Configuration.

import { createNeonAuth } from '@neondatabase/auth/next/server';

process.env.BETTER_AUTH_TRUSTED_PROXY_HEADERS = "true";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

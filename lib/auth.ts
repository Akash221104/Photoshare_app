// lib/auth.ts
// Neon Auth Server Instance Configuration.

import { createNeonAuth } from '@neondatabase/auth/next/server';

if (process.env.VERCEL_URL && !process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

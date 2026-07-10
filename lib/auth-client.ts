// lib/auth-client.ts
// Neon Auth Client — used in React components and hooks for sign-in, sign-up, sign-out, and session.
// Uses @neondatabase/auth/next exclusively. No better-auth imports.

'use client';

import { createAuthClient } from '@neondatabase/auth/next';

export const authClient = createAuthClient();

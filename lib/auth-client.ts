// lib/auth-client.ts
// Neon Auth Client hook setup for React components.

"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();

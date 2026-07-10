// app/api/auth/[...path]/route.ts
// Neon Auth catch-all API route handler.
// This handles all authentication endpoints (sign-in, sign-up, session, etc.)

import { auth } from "@/lib/auth";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();

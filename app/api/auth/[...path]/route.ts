// app/api/auth/[...path]/route.ts
// Catch-all API Route Handler for Neon Auth endpoints.

import { auth } from "@/lib/auth";

export const { GET, POST } = auth.handler();

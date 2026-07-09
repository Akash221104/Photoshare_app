// app/api/auth/[...all]/route.ts
// Catch-all API Route Handler for Better Auth endpoints.

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// middleware.ts
// Neon Auth's built-in middleware for route protection.
// Handles session validation, refresh, and login redirects automatically.

import { auth } from "@/lib/auth";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: [
    // Protect all routes EXCEPT static files, images and public API
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/debug-cookies|auth/).*)",
  ],
};

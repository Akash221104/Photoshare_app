// middleware.ts
// Neon Auth's built-in middleware for route protection.
// Handles session validation, refresh, and login redirects automatically.

import { auth } from "@/lib/auth";

export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};

// middleware.ts
// Neon Auth's built-in middleware for route protection.
// Handles session validation, refresh, and login redirects automatically.

import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

console.log("Edge Middleware Init - Base URL:", process.env.NEON_AUTH_BASE_URL ? "Defined" : "UNDEFINED", "Secret:", process.env.NEON_AUTH_COOKIE_SECRET ? "Defined" : "UNDEFINED");

export const proxy = (req: NextRequest) => {
  console.log("Edge Middleware Request:", req.nextUrl.pathname, "Verifier:", req.nextUrl.searchParams.get("neon_auth_session_verifier") ? "Present" : "Missing");
  return auth.middleware({ loginUrl: "/auth/sign-in" })(req);
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};

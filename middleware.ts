// middleware.ts
// Next.js Route Guard Middleware using standard cookies.
// Protects /dashboard, /profile, and /settings routes.

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token")?.value ||
                        request.cookies.get("__secure-better-auth.session_token")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    // Preserve return URL
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const authRoutes = ["/auth/sign-in", "/auth/sign-up"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
  ],
};

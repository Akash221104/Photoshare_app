// middleware.ts
// Next.js Route Guard Middleware.
// Uses Neon Auth's verifySession to properly validate session cookies.

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check for ANY session cookie — both secure (HTTPS/Vercel) and plain (localhost)
  // Neon Auth / Better Auth sets one of these depending on the environment
  const cookies = request.cookies;
  const hasSession =
    cookies.has("better-auth.session_token") ||
    cookies.has("__Secure-better-auth.session_token") ||
    cookies.has("neon-auth.session-token") ||
    cookies.has("__Secure-neon-auth.session-token") ||
    // Check for any cookie that contains 'session' in its name as a fallback
    [...cookies.getAll()].some(
      (c) => c.name.includes("session") && c.value.length > 10
    );

  if (isProtected && !hasSession) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && hasSession) {
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

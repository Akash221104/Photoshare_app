import { auth } from "@/lib/auth";

export const proxy = auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/events/:id/settings/:path*",
  ],
};

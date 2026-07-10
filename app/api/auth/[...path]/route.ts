// app/api/auth/[...path]/route.ts
// Catch-all API Route Handler for Neon Auth endpoints with configuration safety checks.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, context: any) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    console.error("Missing NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET in environment variables.");
    return NextResponse.json(
      { 
        error: "Missing Configuration", 
        message: "NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET environment variables are missing on the server. Please add them in your Vercel Dashboard project settings." 
      }, 
      { status: 500 }
    );
  }
  const handler = auth.handler();
  return handler.GET(request, context);
}

export async function POST(request: NextRequest, context: any) {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    console.error("Missing NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET in environment variables.");
    return NextResponse.json(
      { 
        error: "Missing Configuration", 
        message: "NEON_AUTH_BASE_URL or NEON_AUTH_COOKIE_SECRET environment variables are missing on the server. Please add them in your Vercel Dashboard project settings." 
      }, 
      { status: 500 }
    );
  }
  const handler = auth.handler();
  return handler.POST(request, context);
}

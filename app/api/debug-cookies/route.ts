// app/api/debug-cookies/route.ts
// Temporary debug endpoint to see what cookies are set on the server.
// Remove this after debugging is done.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  return NextResponse.json({
    cookies: cookies.map(c => ({ name: c.name, valueLength: c.value.length })),
    headers: {
      cookie: request.headers.get("cookie")?.replace(/=[^;]+/g, '=***') ?? null,
    }
  });
}

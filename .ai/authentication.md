# Authentication Flow

User authentication and route protection are handled via `@neondatabase/auth` and Next.js 16's network edge interceptor (`proxy.ts`).

---

## Technical Architecture

### 1. Unified Configuration Singleton (`lib/auth.ts`)
The server-side singleton connects Next.js to the Neon Auth server instance:
```typescript
import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    sameSite: 'lax',
  },
  logLevel: 'debug',
});
```
- **`baseUrl`**: Points to the remote Neon Auth REST endpoint.
- **`cookies.secret`**: Encrypted 32+ character session token key.
- **`cookies.sameSite`**: Configured to `'lax'` to allow cookie preservation during redirect callbacks from Google OAuth.

### 2. Client-Side Auth Hook (`lib/auth-client.ts`)
Provides React client components access to hooks (`useSession()`) and functions (`signIn()`, `signUp()`, `signOut()`):
```typescript
'use client';
import { createAuthClient } from '@neondatabase/auth/next';
export const authClient = createAuthClient();
```

### 3. Edge-Level Route Protection (`proxy.ts`)
Under Next.js 16, route protection middleware is defined in a root-level file named `proxy.ts` exporting a named `proxy` function:
```typescript
import { auth } from "@/lib/auth";
export const proxy = auth.middleware({ loginUrl: "/auth/sign-in" });
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
```
- Matched requests are intercepted.
- If the session resolves to null, the user is redirected to the `/auth/sign-in` page.

### 4. API Proxy Catch-All (`app/api/auth/[...path]/route.ts`)
Proxies incoming client-side auth requests directly to the Neon Auth upstream REST API:
```typescript
import { auth } from "@/lib/auth";
export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
```

---

## Local Development Cookie Security Requirements

Neon Auth utilizes secure session cookies (`__Secure-neonauth.session_token`). 

1. **The Issue:** Browsers enforce strict security for cookies with the `__Secure-` prefix. By specification, they are blocked on unencrypted HTTP connections.
2. **The Fix:** Local development **must** run over HTTPS to allow the browser to accept session cookies. The project scripts include `dev:https`:
   ```bash
   npm run dev:https
   ```
   This generates local SSL certificates using `mkcert` and boots Next.js at `https://localhost:3000`. Developers must proceed past the self-signed warning to authenticate locally.

# Routing Hierarchy

The application is structured around Next.js App Router file-system routes.

---

## Page Routes

| Route Path | Type | Protected | Description |
| :--- | :--- | :--- | :--- |
| `/` | Static/Server | No | Marketing landing page of the application. |
| `/auth/sign-in` | Client | No | Credentials and social Google login card. |
| `/auth/sign-up` | Client | No | New user registration form. |
| `/dashboard` | Client/Server | **Yes** | Shows hosted/joined events and event creation button. |
| `/profile` | Client/Server | **Yes** | Allows updating user details and uploading the profile matching selfie. |
| `/events/[id]` | Client/Server | **Yes** | Displays collaborative event photo gallery, upload options, matched photo searches, and downloads. |
| `/invite/[joinCode]` | Server | No | Auto-redirects unauthenticated users to sign-in; joins authenticated users into the event and routes them to `/events/[id]`. |

---

## Route Interceptor Configuration (`proxy.ts`)
The Edge-level proxy route intercepts incoming requests before the layout loads, matching the paths:
- `/dashboard/:path*`
- `/profile/:path*`
- `/settings/:path*`

If no session cookie exists or session validation fails, the proxy triggers a redirect response to `/auth/sign-in`.

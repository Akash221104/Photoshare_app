# State Management

The application balances client-side interactive state, remote server cache caching, and Edge-level session state.

---

## 1. Client-Side State
- **Form State**: Form fields, validation rules, and error highlights are managed using `react-hook-form` and resolved via Zod schemas.
- **Interactive UI States**: Dialog visibility (e.g. creating events, photo details lightbox) and page loading indicators are managed locally using `useState`.

## 2. Server Cache & Data Fetching
- **TanStack Query (React Query)**: Integrated via `QueryClientProvider` to manage async server states on the client.
- **Convention:** Keys are scoped globally per entity to prevent caching issues:
  - `['events']` / `['events', id]`
  - `['photos', eventId]`
  - `['selfie', eventId]`
  - `['matchedPhotos', eventId]`
  - `['members', eventId]`

## 3. Server-Side Cookie Caching
- **`createNeonAuth` Session Caching**: Sets session cookies (`__Secure-neonauth.session_token`) and caches signed session data inside `__Secure-neon-auth.next.session_data`.
- **`sessionDataTtl`**: Sets a 5-minute cache time-to-live. During this window, server-side actions retrieve session data directly from the cached cookie (reducing upstream database calls).
- **Session Refreshes**: Executed at the Edge proxy level, automatically renewing the session cookie during active user requests.

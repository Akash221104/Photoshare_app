# Architecture Decision Records (ADRs)

This document tracks significant design choices and their rationales.

---

## ADR 001: Leverage `@neondatabase/auth` for User Verification
- **Context:** Building database-backed authentication in a Next.js App Router application.
- **Decision:** Use `@neondatabase/auth` (packaged wrapper of Better Auth) as the central authentication layer.
- **Consequences:** Avoids self-managing user credential tables and encryption algorithms. Uses custom route handler proxy `/api/auth/[...path]` and session cookie storage.

## ADR 002: Use pg-pool Client for Database Communication
- **Context:** Next.js development server hot-reloads create multiple connection leaks to serverless databases.
- **Decision:** Implement a singleton connection pool wrapper (`database/db.ts`) storing the connection instance in `global.pgPool`.
- **Consequences:** Prevents connection limits from being exceeded during local hot-reloads and enables robust parameterized raw queries.

## ADR 003: Double Precision array fallback for Face Embeddings
- **Context:** Development environments and some database branches might run without the PostgreSQL `pgvector` extension.
- **Decision:** Keep the `embedding` column type as `double precision[]` by default, altering it to `vector(512)` dynamically if the extension is present during migrations.
- **Consequences:** Next.js `SearchRepository` detects the extension presence and runs native HNSW vector calculations or falls back to custom client-side JavaScript array math. This ensures maximum compatibility.

## ADR 004: Standardize on Next.js 16 `proxy.ts` Edge Convention
- **Context:** In Next.js 16, the standard `middleware.ts` is deprecated in favor of root-level `proxy.ts`.
- **Decision:** Use root-level `proxy.ts` with named `export const proxy` to protect dashboard, profile, and settings paths.
- **Consequences:** Follows Next.js 16 standards and prevents path routing initialization conflicts.

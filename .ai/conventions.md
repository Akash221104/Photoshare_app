# Coding Conventions and Standards

This document establishes coding standards for the codebase.

---

## 1. Directory Conventions
- **Pages & Routings**: Next.js App Router folders under `/app`.
- **Logic & Services**: Domain business logic kept inside `/services` class structures.
- **SQL Data Layers**: Database queries abstracted inside `/repositories` classes using raw parameterized queries.
- **Custom Hooks**: Interactive state bindings placed under `/hooks`.

## 2. Code Writing & Validation
- **TypeScript**: Enforce strict types. Do not use `any` unless required during third-party library translations.
- **Form Bindings**: Use `react-hook-form` along with Zod schemas from `/schemas`.
- **Database Safety**: Always use parameterized queries (e.g. `query(sql, [param1, param2])`) to prevent SQL Injection.
- **Session Caching**: Respect cookie-based caching limits (5 minutes TTL).

## 3. Local Development Conventions
- **HTTPS Execution**: Always test local auth using `npm run dev:https` to prevent browser secure cookie blocking.
- **Secrets Management**: Read keys from `.env.local` or `.env`. Never commit secrets to the git repository.
- **Docker Compose**: Keep the PostgreSQL configuration in `compose.yaml` aligned with the local variables.

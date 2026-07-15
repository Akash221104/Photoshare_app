# Folder Structure

```
d:/photoshare-app/
├── .ai/                    # Permanent AI Memory System documentation
├── .insforge/              # Backend credentials and metadata settings
├── app/                    # Next.js App Router paths, routes, and layout configurations
│   ├── api/                # Route Handlers for gallery, events, photos, and authentication
│   ├── auth/               # User authentication sign-in/sign-up pages
│   ├── dashboard/          # User personal dashboard pages
│   ├── events/             # Collaborative event galleries
│   ├── invite/             # Invitation link join redirects
│   └── profile/            # User profile setup and selfie management
├── components/             # Reusable UI component library (Tailwind, Shadcn UI)
├── database/               # SQL migrations, database pool connections, and schema seeds
│   ├── migrations/         # PostgreSQL schema definition files
│   └── repositories/       # Core domain database queries (event, photo)
├── hooks/                  # Client-side React hooks for auth and user profiles
├── lib/                    # Configuration singletons (Cloudinary, Neon Auth)
├── repositories/           # Domain repositories (downloads, search, selfies, embeddings)
├── schemas/                # Zod request-body validation schemas
├── services/               # Business logic services (Auth, Cloudinary, Event, Photo, Python, Ranking)
├── photo-ai/               # Hugging Face FastAPI Python face embedding service
└── proxy.ts                # Next.js 16 Edge Proxy (former middleware.ts)
```

## Directory Details

### `/app`
Contains Next.js App Router routes. Pages utilize server-side layout structures and client-side page views. The `/api` directory encapsulates backend API handlers.

### `/components`
UI building blocks including custom wrapper components (`auth-card.tsx`, `register-form.tsx`, `login-form.tsx`, `photo-grid.tsx`) and general Shadcn primitives.

### `/database`
Provides the PostgreSQL client connection setup (`db.ts`). `/database/migrations` contains ordered schema modifications that incrementally bootstrap the PostgreSQL database.

### `/repositories`
Encapsulates data access patterns. It divides queries by domain (e.g. `embedding.repository.ts` for managing InsightFace arrays, `search.repository.ts` for cosine similarity matching).

### `/services`
Coordinates business tasks. For instance, `python.service.ts` connects Next.js to FastAPI; `cloudinary.service.ts` manages remote file uploads; `embedding.service.ts` locks, purges, and enqueues background processing tasks.

### `/photo-ai`
A standalone Python application exposing FastAPI endpoints to detect faces, measure image quality, and generate 512-dimension vector representations. Includes a Gradio interface (`gradio_app.py`) for visual testing.

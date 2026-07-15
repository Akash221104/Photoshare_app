# Technology Stack

## Core Technologies

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.10 | Utilizes React Server Components (RSC) and App Router architecture. |
| **Language** | TypeScript / Python | Next.js built on TS; AI Microservice built on Python 3. |
| **Database** | PostgreSQL | Managed Neon Serverless Postgres instance. |
| **Authentication** | `@neondatabase/auth` | User account management and credentials/social OAuth flows. |
| **AI Models** | `buffalo_l` (InsightFace) | Face detection, bounding box extraction, and 512D float embeddings. |
| **Storage** | Cloudinary | Cloud-based media storage for photos, selfies, and face crops. |

## Sub-System Stack

### Frontend & Styling
- **React 19.2.4**: Core rendering library.
- **Tailwind CSS 4**: Modern styling utility with PostCSS adapter.
- **Base UI & Shadcn**: Accessible, unstyled React UI primitives.
- **Sonner**: Toast notification system.
- **Lucide React**: Vector SVG icons.

### Server & Connection Layers
- **pg 8.22.0**: PostgreSQL database client for transactional SQL queries.
- **Axios 1.18.1**: Client for invoking HTTP request methods to the Python FastAPI microservice.
- **TanStack Query (React Query) 5.101.2**: Asynchronous client-side state caching.
- **Zod 4.4.3**: Request body schema validation.

### Python AI Stack
- **FastAPI**: Lightweight web framework for exposing machine learning services.
- **InsightFace**: State-of-the-art face analysis toolbox.
- **ONNX Runtime**: Engine to run buffalo_l face detection models efficiently.
- **Gradio**: Standard visual interface for local pipeline verification.

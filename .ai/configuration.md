# Configuration Files

## Core Project Configurations

### 1. `next.config.ts`
App configuration defining Next.js compiler behaviors.
- Configures images block to allow loading remote media URLs from Cloudinary (`res.cloudinary.com`) and Hugging Face (`akash2211-photoshare-app.hf.space`).

### 2. `tsconfig.json`
TypeScript compiler settings.
- Configures paths mappings (e.g. `@/*` maps to `./*`) to support clean absolute imports.
- Targets `es2022` with DOM and WebWorker libs.

### 3. `eslint.config.mjs`
JavaScript and TypeScript linting rules. Extends default `next/core-web-vitals` rules.

### 4. `postcss.config.mjs` & `tailwind.config`
Configuration for Tailwind CSS 4 style compiler. Tailors customized transitions and animations.

### 5. `compose.yaml`
Local Docker Compose configuration to boot dependencies:
- `db`: Boots a local PostgreSQL 16 database.
- `ai-service`: Boots a local instance of the face analysis server from the `photo-ai/` folder.
- `app`: Runs the Next.js development server.

### 6. `Dockerfile`
Multi-stage build files:
- Next.js root contains a `Dockerfile` to compile and serve the production Next.js application.
- `photo-ai/` contains a `Dockerfile` running Python 3.10 with ONNX, InsightFace, and FastAPI dependencies.

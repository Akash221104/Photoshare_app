# Domain Modules Memory

This file documents the core logical blocks of the application.

---

## 1. Authentication Module
- **Purpose**: Authenticates users and manages sessions.
- **Entry Points**: `proxy.ts`, `app/api/auth/[...path]/route.ts`.
- **Files Involved**: `lib/auth.ts`, `lib/auth-client.ts`, `components/register-form.tsx`, `components/login-form.tsx`.
- **Dependencies**: `@neondatabase/auth`, `next/headers`, `next/server`.
- **Database Usage**: Updates `users`, `sessions`, `accounts` tables.

## 2. Event Module
- **Purpose**: Event creation, join invites, and member directory administration.
- **Entry Points**: `app/api/events/route.ts`, `app/api/events/[id]/route.ts`, `/invite/[joinCode]`.
- **Files Involved**: `services/event.service.ts`, `database/repositories/event.repository.ts`, `components/create-event-dialog.tsx`.
- **Database Usage**: Operates on `events` and `event_members` tables.

## 3. Photo & Storage Module
- **Purpose**: Photo uploading, file compression, Cloudinary asset saving, and deletion.
- **Entry Points**: `app/api/photos/upload/route.ts`, `app/api/photos/[id]/route.ts`.
- **Files Involved**: `services/photo.service.ts`, `services/cloudinary.service.ts`, `database/repositories/photo.repository.ts`, `components/image-uploader.tsx`.
- **Dependencies**: `cloudinary`, `browser-image-compression`.
- **Database Usage**: Modifies the `photos` table.

## 4. AI Pipeline & Search Module
- **Purpose**: Background face embedding extraction and similarity matches.
- **Entry Points**: `app/api/photos/process/route.ts`, `app/api/selfie/search/route.ts`.
- **Files Involved**: `services/embedding.service.ts`, `services/python.service.ts`, `repositories/embedding.repository.ts`, `repositories/search.repository.ts`.
- **Dependencies**: `axios`, FastAPI microservice.
- **Database Usage**: Populates `photo_faces` and `selfies` tables; runs similarity searches.
- **Limitations**: In-memory background task queue restarts on server hot-reloads.

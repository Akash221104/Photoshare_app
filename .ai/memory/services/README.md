# Services Memory

This file documents all business service classes.

---

## 1. `AuthService` (`services/auth.service.ts`)
- **Responsibilities**: Session checks and profile updates.
- **Entry Points**: Server Actions and API handlers.
- **Database usage**: Queries `users` table.

## 2. `CloudinaryService` (`services/cloudinary.service.ts`)
- **Responsibilities**: Uploads image streams to Cloudinary and schedules remote deletion.
- **Dependencies**: `cloudinary` SDK.

## 3. `EventService` (`services/event.service.ts`)
- **Responsibilities**: Handles event creations, invite code generation, and joining event logs.
- **Database usage**: Uses `EventRepository` to modify `events` and `event_members`.

## 4. `PhotoService` (`services/photo.service.ts`)
- **Responsibilities**: Registers photos in database, deletes files, and handles retry processing.
- **Database usage**: Uses `PhotoRepository` to query `photos`.

## 5. `PythonService` (`services/python.service.ts`)
- **Responsibilities**: Calls FastAPI machine learning endpoints `/analyze` and `/embedding`.
- **Dependencies**: `axios`.
- **Details**: Built-in axios retry loops with exponential backoff on connection timeouts.

## 6. `EmbeddingService` (`services/embedding.service.ts`)
- **Responsibilities**: Coordinates background photo analysis, database locks, and inserts embeddings. Also defines the in-memory sequential `ProcessingQueue`.
- **Database usage**: Uses `EmbeddingRepository` and `PhotoRepository`.

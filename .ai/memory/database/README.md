# Database & Repositories Memory

This file documents database queries and repository layers.

---

## 1. Database Connection Pool (`database/db.ts`)
- **Connection Pattern**:
  - Uses `Pool` from `pg`.
  - Development mode saves the pool instance in `global.pgPool` to prevent connection leaks during Next.js Hot Module Replacement (HMR).
  - Automatically detects cloud connections (Neon, Supabase) and sets `ssl: { rejectUnauthorized: false }`.

## 2. Photo Repository (`database/repositories/photo.repository.ts`)
- **Queries**:
  - `insertPhoto`: Parameterized SQL writing photo entries.
  - `getPhotosByEvent`: Queries photo rows for event ID.
  - `updatePhotoStatus`: Changes photo pipeline status.

## 3. Embedding Repository (`repositories/embedding.repository.ts`)
- **Queries**:
  - `insertEmbedding`: Writes face coordinates and 512D embeddings into `photo_faces` table. Converts array to vector string dynamically if `pgvector` type is found.
  - `deleteEmbedding`: Purges embeddings of a photo (maintaining idempotence on processing retries).
  - `updateProcessingStatus`: Acquires transaction lock to update status safely.

## 4. Search Repository (`repositories/search.repository.ts`)
- **Similarity Queries**:
  - `vectorSearch`: Executes native `<=>` cosine distance operations in SQL if `pgvector` is available.
  - **Fallback Path**: Fetches all embeddings and processes cosine calculations inside Next.js node runtime dynamically.

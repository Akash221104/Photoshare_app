# AI Event Photo Sharing Platform

An event photo sharing platform with face matching capabilities using Next.js 15, FastAPI, Better Auth, PostgreSQL (with PGVector and HNSW), and Cloudinary.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with `pgvector` extension installed.

### Setup Instructions

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy the `.env.example` file to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   Generate a Better Auth secret key:
   ```bash
   npx better-auth secret
   # Or paste a 32-character hexadecimal key into BETTER_AUTH_SECRET
   ```

3. **PostgreSQL Setup**:
   Create a database called `photoshare`.
   Execute the migration DDL scripts located in the `database/migrations` directory in sequential order:
   - `001_extensions.sql`: Enables `uuid-ossp` and `vector` extensions.
   - `002_users.sql`: Creates core user accounts, credentials, and sessions.
   - `003_events.sql`: Creates events and membership mappings.
   - `004_photos.sql`: Creates photo records.
   - `005_vectors.sql`: Creates photo face embeddings and user selfies, including HNSW indexing.
   
   Alternatively, you can run them using psql:
   ```bash
   psql -U postgres -d photoshare -f database/migrations/001_extensions.sql
   psql -U postgres -d photoshare -f database/migrations/002_users.sql
   psql -U postgres -d photoshare -f database/migrations/003_events.sql
   psql -U postgres -d photoshare -f database/migrations/004_photos.sql
   psql -U postgres -d photoshare -f database/migrations/005_vectors.sql
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Authentication Architecture

We use **Better Auth** with the **PostgreSQL pg pool adapter** for secure, database-persisted session authentication.
- **Provider**: Email + Password.
- **Route Guarding**: Next.js Middleware (`middleware.ts`) automatically protects the `/dashboard`, `/profile`, and `/settings` routes, redirecting unauthenticated visitors to `/auth/sign-in`.
- **Form validation**: Performed using `React Hook Form` and `Zod`.
- **Data Layer**: Clean Repository pattern (`database/repositories/`) separating SQL logic from business layers.

## Media Management Module (Phase 5)

We have implemented a production-grade Photo Upload and Gallery system.

### Cloudinary Integration & Folder Structure
Images are uploaded securely to Cloudinary. In order to keep assets organized, we store photos under a structured folder hierarchy:
`events/{eventId}/{photoId}`

*Reasoning*: Organizing uploads by event ID allows us to perform bulk moderation and clean up Cloudinary storage on event deletion, as well as separate access permissions efficiently.

### Environment Variables
To authenticate with Cloudinary, configure the following keys in your `.env` file:
*   `CLOUDINARY_CLOUD_NAME`: The unique name of your Cloudinary cloud.
*   `CLOUDINARY_API_KEY`: The API key utilized to establish the connection.
*   `CLOUDINARY_API_SECRET`: The secure secret key used to sign requests.

### Media Upload Flow
1.  **Browser**: User drops images in `PhotoUploader` drag-and-drop zone.
2.  **Validation**: Client-side validation checks max size (10MB) and formats (JPG, JPEG, PNG, WEBP).
3.  **API Route**: File is sent via Multipart FormData to `POST /api/photos/upload`.
4.  **Cloudinary Service**: Server converts the buffer to a Base64 Data URI and uploads it to Cloudinary.
5.  **Save Metadata**: The secure URL, public ID, format, width, and height are saved in PostgreSQL via the Repository Pattern.
6.  **Return Success**: The client receives a `201` success status, and the event gallery automatically refreshes.

### Permissions
*   **Event Hosts**: Can upload, view, and delete any photo inside their hosted event.
*   **Event Guests**: Can upload, view, and delete ONLY the photos they uploaded themselves.
*   **Non-members**: Denied access to view or upload to the event (403 Forbidden).

### Performance Optimizations
*   **Cloudinary Transformations**: Card thumbnails use c_fill cropping (`w_400,h_250`) to minimize image sizes.
*   **Lazy Loading**: Images use `loading="lazy"` to defer loading until scroll visibility.
*   **Pagination**: Gallery retrieval uses paginated requests (`limit`/`offset`) with "Load More" controls.

## AI Processing Pipeline (Phase 7)

We have implemented a complete, production-grade AI Processing Pipeline that detects faces, extracts 512-dimensional normalized embeddings, and persists them inside PostgreSQL using `PGVector` (with a fallback to `double precision[]` arrays if `pgvector` is not available in local development).

### How AI Processing Works
1. **Queue Dispatch**: On a successful photo upload, Next.js enqueues the `photoId` in an in-memory background processing queue (`ProcessingQueue`) for sequential execution.
2. **FastAPI Inference**: The queue worker dispatches the Cloudinary URL to the FastAPI Python service `/analyze` endpoint.
3. **Download & Match**: FastAPI downloads the image bytes directly from Cloudinary, fixes orientation, and processes the image using `InsightFace` (`buffalo_l`).
4. **Normalized Embeddings**: InsightFace detects all faces, extracts 512D embeddings, and returns bounding box coordinates, confidence scores, and face vectors to Next.js.
5. **PGVector Persist**: Next.js loops through each face and inserts them as separate rows in the `photo_faces` table, including metadata (`model_name`, `embedding_dimension`, `face_index`, `confidence`).
6. **Processing Status**:
   - Starts as `PENDING`.
   - Transitions to `PROCESSING` while FastAPI executes.
   - Transitions to `COMPLETED` when successfully finished (even if 0 faces were detected).
   - Transitions to `FAILED` if FastAPI is offline, returns invalid schema, or fails.

### Bounding Boxes
We store `x`, `y`, `width`, `height`, and `confidence` separately for every face. In Next.js, we translate the InsightFace `[x1, y1, x2, y2]` coordinates into standard width/height dimensions.

### Performance & Locking Strategy
To prevent duplicate processing, duplicate embeddings, or processing already completed photos, we employ a database-level lock. Before starting, we attempt to conditionally update the photo status:
```sql
UPDATE photos 
SET processing_status = 'PROCESSING', processing_started_at = CURRENT_TIMESTAMP
WHERE id = $1 AND processing_status IN ('PENDING', 'FAILED')
RETURNING id;
```
If the lock is acquired, we proceed. If not, the worker exits immediately. On retries, we clean up any pre-existing face embeddings for that photo to ensure idempotence.

### Retry System
If a photo fails processing, a "Retry" button appears on its gallery thumbnail. Clicking it sends a request to `/api/photos/{photoId}/retry`, resets the status to `PENDING` (clearing error logs), and enqueues the photo back into the sequential processing queue.

### Future Queue Integration
The queue service implements a standard sequential FIFO queue. It is decoupled from the Rest API and business logic so that Redis and BullMQ can be dropped in for distributed processing in the future without major code changes.


## Selfie Search Engine & Personal Gallery (Phase 8)

We have implemented a complete, production-grade **Selfie Search Engine & Personal Gallery** allowing users to instantly find all photos containing their face in a specific event.

### Complete Selfie Search Flow
1. **Selfie Capture/Upload**: A user selects an event, navigates to the "Spotted Me" tab, and either takes a selfie using their webcam (snapped via HTML5 video stream and rendered onto canvas) or uploads a local file.
2. **Deterministic Cloudinary Storage**: Next.js streams the base64 data to Cloudinary under the path `events/{eventId}/selfies/{userId}/original` with `overwrite: true`, replacing any previous selfie for this user in this event.
3. **FastAPI Embeddings Generation**: Next.js dispatches the Cloudinary URL to the FastAPI `/embedding` endpoint. FastAPI downloads the image, verifies that exactly **one** face is present with detection confidence `>= 0.60`, and returns a 512D L2-normalized face vector.
4. **Embedding Caching**: The embedding is saved in the `selfies` table. When returning, the user's matched gallery is immediately available and does not trigger re-inference unless the user replaces or deletes their selfie.
5. **PGVector Similarity Search**: Next.js queries PostgreSQL using the `<=>` operator (cosine distance) to search all `photo_faces` within the current event's photos:
   `(1 - (pf.embedding <=> query_embedding)) AS similarity`
6. **Precision & Recall Tuning**: The user can dynamically adjust the similarity threshold slider (default `0.40`). Increasing the threshold increases Precision (fewer false matches), while lowering it increases Recall (finds more photos of you, potentially with similar-looking guests).
7. **Deduplication & Ranking**: The search service removes duplicate photos (keeps only the highest similarity score if multiple faces in a single photo match), ranks matches from highest similarity to lowest, and returns the personal gallery.

### Key Performance Optimizations
* **HNSW Indexing**: Similarity searches are accelerated using pgvector's Hierarchical Navigable Small World (HNSW) index on the embeddings column.
* **Database Fallback**: In local development environments without `pgvector` installed, the system automatically detects this and falls back to in-memory Javascript-based cosine similarity computations, preventing database compilation errors.
* **Top-K Search & Pagination**: Matched gallery images are paginated (`limit`/`offset`) with infinite scroll support.

#   P h o t o s h a r e _ a p p  
 
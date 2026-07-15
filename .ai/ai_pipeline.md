# AI Processing Pipeline

The AI Event Photo Share application integrates face detection, embedding vectors, and cosine similarity matches to locate user photos in event galleries.

---

## Processing Workflows

### 1. Photo Ingest and Cloudinary Upload
- Users select and upload images from event views.
- Uploaded media files are sent to Cloudinary.
- Next.js writes a photo metadata row into PostgreSQL `photos` table with status `PENDING`.
- Next.js enqueues the photo ID into the in-memory `processingQueue`.

### 2. Sequential Background Processing
- The queue executes the photo task sequentially.
- Next.js transitions the photo `processing_status` to `PROCESSING` to obtain a lock.
- Next.js calls the Hugging Face hosted Python FastAPI AI service `/analyze` endpoint, passing the Cloudinary image URL.
- The Python AI Service:
  - Detects all faces using the `buffalo_l` InsightFace model.
  - Computes a 512-dimension face embedding for each face.
  - Measures facial parameters (yaw, pitch, roll, brightness, blur, sharpness, size).
- Next.js parses the Python service response, deletes any old face embeddings for the photo (idempotence safety), and writes the coordinates, face metadata, and embeddings into the `photo_faces` table.
- Next.js sets `processing_status` to `COMPLETED`.

### 3. User Selfie Profiling
- To filter photos of themselves, users upload a selfie from the profile section.
- Next.js uploads the selfie to Cloudinary and requests its embedding from the Python service `/embedding` endpoint.
- The `/embedding` service validates that exactly one face exists. If more or fewer are found, it returns an HTTP 400 error.
- Next.js saves the selfie metadata and 512-dimension embedding into the `selfies` table.

### 4. Vector Search and Cosine Similarity Matching
- When a user searches for matching photos in an event:
- Next.js calls `searchRepository.vectorSearch(eventId, selfieEmbedding, threshold)`.
- If the `vector` type extension is active in the Postgres database:
  - Executes a native `pgvector` index search using `<=>` (cosine distance operators):
    ```sql
    (1 - (pf.embedding <=> $2::vector(512))) AS similarity
    ```
- If the `vector` type is missing (local development without pgvector):
  - Fetches all `photo_faces` embeddings for the event and computes cosine similarity in JavaScript:
    ```typescript
    const cosineSimilarity = (a: number[], b: number[]): number => {
      let dotProduct = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    ```
  - Filters results by `similarity >= threshold` and returns matched photo records.

# Functional Features Memory

This file documents multi-part workflows and user journeys.

---

## 1. Collaborative Event Registration and Invite
- **User Journey**:
  1. A Host creates an event inside the Dashboard.
  2. Next.js generates a random alphanumeric string (join code) and creates records in `events` and `event_members`.
  3. Host shares the invitation link (e.g. `/invite/JOINCODE`).
  4. Guest visits `/invite/JOINCODE`. Next.js middleware and invite page handler verify user session.
  5. If authenticated, the user is joined as a `guest` and redirected to `/events/[id]`.

## 2. Collaborative Photo Upload and Processing
- **User Journey**:
  1. Participants select files to upload in an event.
  2. Files are compressed locally on the client and sent to Cloudinary.
  3. Postgres registers the photo as `PENDING`.
  4. Photo ID is enqueued. Background queue invokes `EmbeddingService` sequentially.
  5. Photo is analyzed by FastAPI Python server, extracting face coordinates and 512D embeddings.
  6. Next.js saves embeddings to `photo_faces` table, transitioning photo status to `COMPLETED`.

## 3. Selfie Matching and Search
- **User Journey**:
  1. User uploads a selfie in their profile.
  2. System extracts a single reference facial embedding and saves it to `selfies` table.
  3. When browsing an event gallery, the guest clicks "Find My Photos".
  4. Next.js fetches the selfie embedding and runs a cosine similarity search against all event `photo_faces`.
  5. Matches exceeding similarity thresholds (e.g., 0.40) are returned and displayed to the guest.

# API Endpoints Memory

This file documents endpoint route handler implementations.

---

## 1. `/api/auth/[...path]`
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- **Implementation**: Calls `auth.handler()`. Proxies incoming auth endpoints directly to Neon Auth.

## 2. `/api/events`
- **Methods**:
  - `GET`: Returns user events list.
  - `POST`: Validates request body with `eventSchema` and inserts new event.

## 3. `/api/events/[id]/photos`
- **Methods**:
  - `GET`: Retrieves photos for the event sorted by `created_at DESC`.

## 4. `/api/photos/upload`
- **Methods**:
  - `POST`: Extracts file streams from `multipart/form-data`, uploads them to Cloudinary, writes database rows with `PENDING` status, and pushes IDs to `processingQueue`.

## 5. `/api/selfie/upload`
- **Methods**:
  - `POST`: Uploads the user selfie, calls Python `/embedding` service, and inserts embedding record into `selfies` table.

## 6. `/api/selfie/search`
- **Methods**:
  - `POST`: Reads event ID and threshold parameter, fetches selfie embedding, and runs `vectorSearch` returning JSON matched photos list.

# API Specifications

All custom backend APIs are implemented under the `/app/api` directory using Next.js Route Handlers. They require standard session validation (which checks cookies) to protect user and event data.

---

## Authentication Endpoints
- **Catch-All Handler**: `app/api/auth/[...path]/route.ts`
  - Handles proxy actions (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) to communicate with `NEON_AUTH_BASE_URL` (e.g. sign-in, sign-up, session validations, Google OAuth redirects).
- **Cookie Debugger**: `/api/debug-cookies`
  - `GET`: Returns the length of session cookies and request headers (for debugging local cookie security).

---

## Event Management Endpoints
- **All Events**: `/api/events`
  - `GET`: Retrieves events hosted by or joined by the authenticated user.
  - `POST`: Creates a new event (requires name, description, and upload_mode validation via `eventSchema`).
- **Single Event**: `/api/events/[id]`
  - `GET`: Retrieves detailed event information (name, description, upload_mode, join_code).
  - `PUT`: Updates event settings (validation via `eventSchema`).
  - `DELETE`: Destroys the event and cascading dependencies.
- **Event Invites**:
  - **Join Event**: `/api/events/[id]/join`
    - `POST`: Verifies authentication and joins the event using the event's unique `join_code`.
  - **Leave Event**: `/api/events/[id]/leave`
    - `POST`: Removes the member from the event.
  - **Members List**: `/api/events/[id]/members`
    - `GET`: Lists all users joined in the event.
  - **Remove Member**: `/api/events/[id]/members/[memberId]`
    - `DELETE`: Allows the host to remove a specific guest.
  - **Stats**: `/api/events/[id]/stats`
    - `GET`: Returns counts of total photos, matched photos, and joined members.

---

## Photo Endpoints
- **Event Gallery**: `/api/events/[id]/photos`
  - `GET`: Fetches all processed and processing photo rows belonging to the event.
- **Photo Operations**: `/api/photos/[id]`
  - `GET`: Retrieves single photo details.
  - `DELETE`: Removes the photo from Postgres and schedules deletion in Cloudinary.
  - `PATCH`: Modifies individual photo attributes.
- **Upload Photo**: `/api/photos/upload`
  - `POST`: Uploads event photos to Cloudinary and registers them in the database as `PENDING`. Dispatches the photo ID to `processingQueue`.
- **Force Process**: `/api/photos/process`
  - `POST`: Forces background processing of a photo by ID.
- **Retry Processing**: `/api/photos/[id]/retry`
  - `POST`: Triggers a retry loop on a photo that previously failed facial analysis.

---

## Selfie & Matching Endpoints
- **User Selfie**: `/api/selfie`
  - `GET`: Retrieves the selfie record for the authenticated user in a specific event.
  - `DELETE`: Deletes the selfie.
- **Upload Selfie**: `/api/selfie/upload`
  - `POST`: Uploads a selfie, extracts the 512D face embedding via `/embedding` Python service, and saves it to the `selfies` table.
- **Matched Photos**: `/api/selfie/search`
  - `POST`: Performs a vector similarity search comparing the user's selfie embedding with all faces detected in the event photos, returning matching images.

---

## Download Endpoints
- **Upload Archive**: `/api/download/uploaded`
  - `POST`: Bundles all photos uploaded by the user into a ZIP file.
- **Selected Photos**: `/api/download/selected`
  - `POST`: Bundles a specific array of photo IDs into a ZIP file.
- **Matched Photos**: `/api/download/matched`
  - `POST`: Bundles all event photos matching the user's selfie into a ZIP file.

# Environment Variables

The application reads system environment keys from the local `.env` file.

| Name | Type | Description |
| :--- | :--- | :--- |
| `DATABASE_HOST` | String | PostgreSQL database hostname. |
| `DATABASE_PORT` | Number | PostgreSQL port (defaults to `5432`). |
| `DATABASE_USER` | String | Database connection user. |
| `DATABASE_PASSWORD` | String | Database connection password. |
| `DATABASE_NAME` | String | Database name. |
| `DATABASE_MAX_CONNECTIONS` | Number | Pool size setting (defaults to `5` in dev, `20` in prod). |
| `DATABASE_URL` | String | Full PostgreSQL connection URL (e.g. `postgresql://...`). |
| `NEON_AUTH_BASE_URL` | String | Remote Neon Auth REST API base URL. |
| `NEON_AUTH_COOKIE_SECRET`| String | Minimum 32-character random secret to sign session cookies. |
| `CLOUDINARY_CLOUD_NAME` | String | Cloudinary storage account name. |
| `CLOUDINARY_API_KEY` | String | Cloudinary API authorization key. |
| `CLOUDINARY_API_SECRET` | String | Cloudinary secret credentials. |
| `CLOUDINARY_URL` | String | Fully qualified Cloudinary configuration URL. |
| `AI_SERVICE_URL` | String | FastAPI Python inference service base URL (local or Hugging Face Space). |
| `AI_SERVICE_API_KEY` | String | API key to secure the Python AI microservice (optional). |

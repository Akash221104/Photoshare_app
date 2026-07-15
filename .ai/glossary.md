# Glossary

Terms and definitions used in this codebase:

- **Event**: A collaborative photo gallery hosted by a host. Guests can join via a unique join code and upload images.
- **Selfie**: A reference photograph uploaded by a user to extract their facial features, enabling the system to match event photos to them.
- **Face Bounding Box**: Bounding box coordinates `[x1, y1, x2, y2]` denoting the position of a face inside an image.
- **InsightFace**: Face analysis library containing models (like `buffalo_l`) to detect faces, measure attributes, and extract embeddings.
- **Embedding**: A 512-dimension floating-point array (double precision) mathematically representing unique facial features.
- **Cosine Distance / Similarity**: Metric used to calculate the similarity between two facial vectors. Values range from -1 to 1 (values above 0.35 - 0.45 generally indicate a match).
- **Proxy**: Next.js 16 Edge-level network request interceptor that replaces legacy `middleware.ts`.
- **Neon Auth / Better Auth**: The core managed authentication service linked to the Postgres database.

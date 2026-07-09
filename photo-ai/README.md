# PhotoShare AI Inference Service

A high-performance, standalone Python AI microservice designed to perform face detection and L2-normalized embedding extraction. Powered by **FastAPI** and **InsightFace** (`buffalo_l` model), running entirely on CPU.

---

## Folder Structure

```
photo-ai/
├── app/
│   ├── config/
│   │   └── config.py        # System level configs, MIME restrictions, log formats
│   ├── schemas/
│   │   └── schemas.py       # Pydantic JSON request/response shapes
│   └── services/
│       ├── model_loader.py  # Singleton manager for buffalo_l lazy-loading
│       ├── image_service.py # Image conversions, exif orientation, BGR checks
│       └── face_service.py  # Face scans, landmarks, normalizing embedding vectors
├── tests/
│   └── test_api.py          # API route testing using FastAPI's TestClient
├── main.py                  # Entrypoint: sets up middlewares, CORS, startup warmups
├── requirements.txt         # Pinned production dependencies
└── README.md                # This manual
```

---

## Installation & Setup

1.  **Navigate into the directory**:
    ```bash
    cd photo-ai
    ```

2.  **Create and activate a virtual environment** (recommended):
    ```bash
    python -m venv venv
    
    # On Windows:
    .\venv\Scripts\activate
    
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

---

## Running the Server

Start the FastAPI application server locally using **Uvicorn**:

```bash
python main.py
# Or directly via Uvicorn command line:
uvicorn main:app --host 0.0.0.0 --port 8000
```

Once started:
*   The Swagger UI documentation is available at: [http://localhost:8000/docs](http://localhost:8000/docs)
*   The ReDoc documentation is available at: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Model Downloads & Initial Warmup

On first startup, the model loader will search your system's cache folder for the `buffalo_l` weights:
*   If not found, InsightFace will automatically download the 270MB archive from the official CDN and extract it into `~/.insightface/models/`.
*   During this download, the server startup will block until the download completes successfully.
*   Once cached, subsequent startups will warm up in ~2 seconds.

---

## REST Endpoints Overview

### `GET /health`
Verifies service state and tests model initialization.

**Example Response**:
```json
{
  "status": "healthy",
  "model": "buffalo_l",
  "provider": "CPUExecutionProvider",
  "uptime": 2.45
}
```

### `POST /detect`
Accepts a multipart file upload (`file`) and returns coordinates and landmarks for all detected faces.

### `POST /embedding`
Accepts a single-face image (e.g. selfie) and returns its 512-dimensional normalized embedding vector.

### `POST /analyze`
Comprehensive route that detects all faces, gets normalized embeddings, estimated ages, and genders for each.

---

## Run Unit Tests

Execute the test suite using `pytest`:

```bash
pytest tests/
```

# Dockerfile (FastAPI Python AI Service)
FROM python:3.11-slim-bookworm

# Install system dependencies required for OpenCV and ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

EXPOSE 8000

ENV HOST=0.0.0.0
ENV PORT=8000

# Execute uvicorn server
CMD ["python", "main.py"]

# photo-ai/tests/test_api.py
# Unit tests for health checks and validation error boundaries.

import io
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    """
    Verifies that the GET /health check completes successfully.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model"] == "buffalo_l"
    assert data["provider"] == "CPUExecutionProvider"

def test_detect_no_file():
    """
    Validates that a missing file results in 422 Unprocessable Entity.
    """
    response = client.post("/detect")
    assert response.status_code == 422

def test_detect_unsupported_format():
    """
    Verifies that uploading a PDF or other forbidden format returns a 400 Bad Request.
    """
    # Create a mock text file
    file_payload = {"file": ("document.pdf", b"mock pdf contents", "application/pdf")}
    response = client.post("/detect", files=file_payload)
    assert response.status_code == 400
    assert "Invalid or corrupted image format" in response.json()["detail"]

def test_detect_empty_or_corrupted():
    """
    Ensures that empty or corrupted files trigger a 400 error.
    """
    file_payload = {"file": ("empty.jpg", b"", "image/jpeg")}
    response = client.post("/detect", files=file_payload)
    assert response.status_code == 400

def test_detect_size_exceeded():
    """
    Ensures that files exceeding the 10MB limit are rejected with 400.
    """
    # 11MB of mock data
    large_payload = {"file": ("huge.jpg", b"\0" * (11 * 1024 * 1024), "image/jpeg")}
    response = client.post("/detect", files=large_payload)
    assert response.status_code == 400
    assert "size" in response.json()["detail"].lower()

from unittest.mock import patch

@patch("requests.get")
def test_embedding_no_face(mock_get):
    """
    Ensures that generating an embedding for a blank image results in a 400 error.
    """
    # Create a pure black PIL image
    img = Image.new("RGB", (100, 100), color="black")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    class MockResponse:
        status_code = 200
        content = img_bytes
        headers = {"content-type": "image/jpeg"}

    mock_get.return_value = MockResponse()

    response = client.post("/embedding", json={"url": "http://example.com/black.jpg"})
    assert response.status_code == 400
    assert "No faces detected" in response.json()["detail"]

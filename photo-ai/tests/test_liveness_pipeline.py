# photo-ai/tests/test_liveness_pipeline.py
# Unit tests for the active liveness pipeline.

import io
from PIL import Image
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)

def test_verify_liveness_missing_parameters():
    """
    Asserts that missing baseline, video, or challenge parameters returns 422.
    """
    response = client.post("/liveness/verify")
    assert response.status_code == 422

def test_verify_liveness_no_face_detected():
    """
    Verifies that running liveness checks on blank black images
    results in a 400 Bad Request error stating "No face detected".
    """
    # Create mock black image
    img = Image.new("RGB", (100, 100), color="black")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    baseline_bytes = img_byte_arr.getvalue()

    # Create mock empty video file
    video_bytes = b"mock video webm contents"

    files_payload = {
        "baseline_img": ("baseline.jpg", baseline_bytes, "image/jpeg"),
        "video": ("video.webm", video_bytes, "video/webm")
    }
    data_payload = {
        "challenges": "LOOK_LEFT,SMILE"
    }

    response = client.post("/liveness/verify", files=files_payload, data=data_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is False
    assert any("No face detected" in reason for reason in data["failure_reasons"])

# photo-ai/app/api/endpoints.py
# FastAPI routes exposing the health check and ML inference endpoints.

import time
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Form
from typing import List

from app.schemas.schemas import (
    HealthResponse,
    DetectionResponse,
    EmbeddingResponse,
    AnalyzeResponse,
    ErrorResponse,
    AnalyzeRequest
)
from app.services.model_loader import ModelLoader
from app.services.image_service import ImageService
from app.services.face_service import FaceService
from app.services.liveness.models.result import LivenessResponse
from app.services.liveness.orchestrator import LivenessOrchestrator
from app.config.config import MODEL_NAME, logger

router = APIRouter()
model_loader = ModelLoader()
START_TIME = time.time()

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check service health and model status"
)
async def health_check():
    """
    Checks the status of the model loader and execution providers.
    """
    uptime = time.time() - START_TIME
    if not model_loader.is_loaded():
        # Triggers lazy initialization on the health check endpoint to warm up model
        try:
            model_loader.load_model()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Model loading failure: {str(e)}"
            )

    return HealthResponse(
        status="healthy",
        model=MODEL_NAME,
        provider="CPUExecutionProvider",
        uptime=uptime
    )

@router.post(
    "/detect",
    response_model=DetectionResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Detect faces in an image"
)
async def detect_faces(file: UploadFile = File(..., description="JPEG, PNG, or WebP photo to scan")):
    """
    Upload an image to scan for faces. Returns bounding boxes, landmarks, and confidence scores.
    """
    start_inference = time.time()
    try:
        file_bytes = await file.read()
        np_img = ImageService.validate_and_read(file_bytes, file.content_type or "")
        faces = FaceService.detect_faces(np_img)
        
        inference_time = time.time() - start_inference
        logger.info(f"Detection completed in {inference_time:.3f}s for {file.filename}")
        
        return DetectionResponse(
            face_count=len(faces),
            faces=faces
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as err:
        logger.error(f"Inference error: {str(err)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Inference processing failed")

@router.post(
    "/embedding",
    response_model=EmbeddingResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Generate 512-dimension normalized face embedding"
)
async def get_embedding(request: AnalyzeRequest):
    """
    Downloads a photo containing a single face (selfie) from a URL, verifies exactly one face is present,
    and returns its normalized 512-dimensional vector.
    """
    start_inference = time.time()
    try:
        import requests
        url = request.url
        logger.info(f"Downloading selfie for embedding from URL: {url}")
        
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            raise ValueError(f"Failed to download image from URL (HTTP status code {response.status_code})")
            
        file_bytes = response.content
        content_type = response.headers.get("content-type", "image/jpeg")
        
        np_img = ImageService.validate_and_read(file_bytes, content_type)
        
        # We need to detect all faces first to verify exactly one face is present
        app = ModelLoader().load_model()
        faces = app.get(np_img)
        
        if len(faces) == 0:
            raise ValueError("No faces detected in the image")
        if len(faces) > 1:
            raise ValueError("Multiple faces detected in the image. Exactly one face is required.")
            
        primary_face = faces[0]
        confidence = float(primary_face.det_score)
        
        # Require a clear face (detection score >= 0.60)
        CONFIDENCE_THRESHOLD = 0.60
        if confidence < CONFIDENCE_THRESHOLD:
            raise ValueError(f"Face detection confidence too low ({confidence:.2f}). Please upload a clearer face.")
            
        # L2 Normalize the embedding vector
        emb = primary_face.embedding
        norm = np.linalg.norm(emb)
        normed_emb = (emb / norm).tolist() if norm > 0 else emb.tolist()
        
        inference_time = time.time() - start_inference
        logger.info(f"Selfie embedding generated in {inference_time:.3f}s. Confidence: {confidence:.2f}")
        
        return EmbeddingResponse(
            embedding_dimension=len(normed_emb),
            embedding=normed_emb,
            confidence=confidence,
            bbox=primary_face.bbox.tolist()
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as err:
        logger.error(f"Inference error: {str(err)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Selfie processing failed: {str(err)}")

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Perform comprehensive face analysis"
)
async def analyze_faces(request: AnalyzeRequest):
    """
    Full inference sweep: downloads the image from its URL, detects all faces, and extracts 512D embeddings.
    """
    start_inference = time.time()
    try:
        import requests
        url = request.url
        logger.info(f"Downloading image for analysis from URL: {url}")
        
        # Download the image with timeout
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            raise ValueError(f"Failed to download image from URL (HTTP status code {response.status_code})")
        
        file_bytes = response.content
        content_type = response.headers.get("content-type", "image/jpeg")
        
        np_img = ImageService.validate_and_read(file_bytes, content_type)
        faces = FaceService.analyze_faces(np_img)
        
        inference_time = time.time() - start_inference
        logger.info(f"Analysis completed in {inference_time:.3f}s for URL: {url}. Face count: {len(faces)}")
        
        return AnalyzeResponse(
            face_count=len(faces),
            faces=faces
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as err:
        logger.error(f"Inference error: {str(err)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis processing failed: {str(err)}")

@router.post(
    "/liveness/verify",
    response_model=LivenessResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Verify user active liveness and extract face embedding"
)
async def verify_liveness(
    baseline_img: UploadFile = File(..., description="JPEG/PNG baseline still image (neutral pose)"),
    video: UploadFile = File(..., description="WebM/MP4 challenge recording (4-second duration)"),
    challenges: str = Form(..., description="Comma-separated challenge ID strings, e.g. 'LOOK_RIGHT,SMILE'")
):
    """
    Validates user liveness using a hybrid sequence:
    1. Extracts baseline face embedding from the neutral still photo.
    2. Sequentially processes the video clip, checking that the requested challenges were met in order.
    3. Calculates a final weighted liveness score.
    """
    try:
        baseline_bytes = await baseline_img.read()
        video_bytes = await video.read()
        
        challenge_list = [c.strip() for c in challenges.split(",") if c.strip()]
        
        result = LivenessOrchestrator.verify_liveness(
            baseline_img_bytes=baseline_bytes,
            video_bytes=video_bytes,
            challenges=challenge_list
        )
        
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as err:
        logger.error(f"Liveness API endpoint failed: {str(err)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Liveness verification failed: {str(err)}")

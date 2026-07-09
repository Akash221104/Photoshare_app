# photo-ai/app/schemas/schemas.py
# Pydantic schemas representing request validation targets and JSON response structures.

from pydantic import BaseModel, Field
from typing import List

class HealthResponse(BaseModel):
    status: str = Field(..., description="Application operational state")
    model: str = Field(..., description="Loaded InsightFace model name")
    provider: str = Field(..., description="ONNX execution provider (e.g. CPUExecutionProvider)")
    uptime: float = Field(..., description="Uptime duration in seconds")

class FaceDetail(BaseModel):
    bbox: List[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")
    confidence: float = Field(..., description="Detection confidence score (0.0 to 1.0)")
    landmarks: List[List[float]] = Field(..., description="5 facial landmark coordinate pairs")

class DetectionResponse(BaseModel):
    face_count: int = Field(..., description="Total faces detected in the image")
    faces: List[FaceDetail] = Field(..., description="Metadata list for each detected face")

class EmbeddingResponse(BaseModel):
    embedding_dimension: int = Field(512, description="Dimension of the embedding vector ( buffalo_l is 512)")
    embedding: List[float] = Field(..., description="512-dimensional normalized embedding vector")
    confidence: float = Field(..., description="Detection confidence score")
    bbox: List[float] = Field(..., description="Bounding box of the target face")

class AnalyzeDetail(BaseModel):
    bbox: List[float] = Field(...)
    confidence: float = Field(...)
    landmarks: List[List[float]] = Field(...)
    age: int = Field(..., description="Estimated age")
    gender: str = Field(..., description="Estimated gender ('M' or 'F')")
    embedding: List[float] = Field(..., description="512-dimensional normalized embedding vector")
    face_width: int = Field(..., description="Width of the face box")
    face_height: int = Field(..., description="Height of the face box")
    face_area: int = Field(..., description="Area of the face box")
    face_ratio: float = Field(..., description="Ratio of face area to image area")
    yaw: float = Field(..., description="Pose yaw estimation")
    pitch: float = Field(..., description="Pose pitch estimation")
    roll: float = Field(..., description="Pose roll estimation")
    blur: float = Field(..., description="Normalized blur score")
    sharpness: float = Field(..., description="Laplacian variance sharpness score")
    brightness: float = Field(..., description="Average gray level brightness score")
    occlusion_score: float = Field(..., description="Occlusion estimate score")
    face_quality: float = Field(..., description="Unified quality score")
    image_width: int = Field(..., description="Image width")
    image_height: int = Field(..., description="Image height")
    processing_version: str = Field(..., description="Processing version")

class AnalyzeResponse(BaseModel):
    face_count: int = Field(..., description="Total faces analyzed")
    faces: List[AnalyzeDetail] = Field(..., description="Detailed face analysis outputs")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Description of the error occurred")

class AnalyzeRequest(BaseModel):
    url: str = Field(..., description="HTTP(S) Cloudinary URL of the image to analyze")

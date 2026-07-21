# photo-ai/app/services/liveness/models/result.py
# Pydantic schemas representing liveness response outputs.

from pydantic import BaseModel, Field
from typing import List, Optional

class LivenessChecks(BaseModel):
    face_consistency: bool = Field(..., description="Same face matches across baseline and video frames")
    pose_challenges: bool = Field(..., description="Expected pose yaw/pitch was achieved")
    temporal_continuity: bool = Field(..., description="Transitions between frames were continuous (no cuts)")
    face_stability: bool = Field(..., description="Face detector did not lose tracking")
    quality_metrics: bool = Field(..., description="Image brightness, sharpness, blur, and size passed")

class LivenessResponse(BaseModel):
    score: float = Field(..., description="Total combined liveness score (0.0 to 100.0)")
    passed: bool = Field(..., description="True if liveness validation was successful")
    confidence: float = Field(..., description="Detection confidence score")
    checks: LivenessChecks = Field(..., description="Breakdown of individual check passes")
    failure_reasons: List[str] = Field(..., description="Actionable feedback messages for the user")
    embedding: Optional[List[float]] = Field(None, description="Extracted 512D baseline face embedding if passed")

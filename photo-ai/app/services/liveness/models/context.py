# photo-ai/app/services/liveness/models/context.py
# Unified execution context class for the liveness pipeline.

from typing import List, Dict, Any
import numpy as np

class LivenessContext:
    def __init__(self, baseline_img_bytes: bytes, video_bytes: bytes, challenges: List[str]):
        self.baseline_img_bytes = baseline_img_bytes
        self.video_bytes = video_bytes
        self.challenges = challenges
        
        # Data populated during the pipeline execution
        self.baseline_face: Dict[str, Any] = {}      # Baseline face details (embedding, bbox, etc.)
        self.frames: List[np.ndarray] = []           # OpenCV images representing sampled frames
        self.face_track: List[Dict[str, Any]] = []   # Face detection & landmark outputs for each frame
        
        self.quality_metrics: List[Dict[str, Any]] = [] # Brightness, blur, size, and occlusion scores
        self.pose_metrics: List[Dict[str, Any]] = []    # Estimated pose metrics (yaw, pitch, roll)
        
        # Evaluation outcomes
        self.scores: Dict[str, float] = {}           # Scores for each component (0.0 to 100.0)
        self.passed: Dict[str, bool] = {}            # Binary validation outputs for each check
        self.failure_reasons: List[str] = []         # User-facing failure messages
        self.results: Dict[str, Any] = {}            # Pipeline run results (e.g. challenge indices)

# photo-ai/app/services/liveness/pipeline/tracker.py
# Tracks face bounding box coordinates and pose angles across frames to check stability and continuity.

from typing import List, Dict, Any
from app.services.liveness.models.context import LivenessContext
from app.config.config import logger

class Tracker:
    @staticmethod
    def calculate_iou(box1: List[float], box2: List[float]) -> float:
        """
        Computes Intersection over Union (IoU) of two bounding boxes.
        Format: [x1, y1, x2, y2]
        """
        xa = max(box1[0], box2[0])
        ya = max(box1[1], box2[1])
        xb = min(box1[2], box2[2])
        yb = min(box1[3], box2[3])
        
        inter_area = max(0.0, xb - xa) * max(0.0, yb - ya)
        
        box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
        box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
        
        union_area = float(box1_area + box2_area - inter_area)
        if union_area <= 0:
            return 0.0
            
        return float(inter_area / union_area)

    @staticmethod
    def validate_tracking(context: LivenessContext) -> None:
        """
        Validates:
        1. Face stability: Face detected in at least 85% of sampled frames.
        2. Temporal continuity: Bounding box IoU and pose yaw/pitch transitions
           must be smooth. Instaneous coordinate jumps or pose snaps fail.
        """
        total_frames = len(context.frames)
        if total_frames == 0:
            context.passed["face_stability"] = False
            context.scores["face_stability"] = 0.0
            context.passed["temporal_continuity"] = False
            context.scores["temporal_continuity"] = 0.0
            context.failure_reasons.append("No video frames extracted.")
            return

        detected_count = 0
        iou_violations = 0
        pose_violations = 0

        last_bbox = None
        last_yaw = None
        last_pitch = None

        for idx in range(total_frames):
            face = context.face_track[idx]
            pose = context.pose_metrics[idx] if idx < len(context.pose_metrics) else None

            if face is not None:
                detected_count += 1
                
                # 1. Bounding box jump check
                bbox = face["bbox"]
                if last_bbox is not None:
                    iou = Tracker.calculate_iou(last_bbox, bbox)
                    if iou < 0.30:
                        iou_violations += 1
                last_bbox = bbox

                # 2. Pose angle snap check
                if pose is not None:
                    yaw = pose["yaw"]
                    pitch = pose["pitch"]
                    
                    if last_yaw is not None:
                        diff_yaw = abs(yaw - last_yaw)
                        # More than 30 degrees yaw jump between sampled frames (e.g. 200ms) is unnatural
                        if diff_yaw > 30.0:
                            pose_violations += 1
                            
                    if last_pitch is not None:
                        diff_pitch = abs(pitch - last_pitch)
                        # More than 20 degrees pitch jump is unnatural
                        if diff_pitch > 20.0:
                            pose_violations += 1
                            
                    last_yaw = yaw
                    last_pitch = pitch
            else:
                last_bbox = None
                last_yaw = None
                last_pitch = None

        # Calculate stability metrics
        stability_ratio = detected_count / total_frames
        stability_score = stability_ratio * 100.0
        context.scores["face_stability"] = stability_score
        context.passed["face_stability"] = stability_score >= 85.0

        if not context.passed["face_stability"]:
            context.failure_reasons.append("Face detection is unstable. Keep your face clearly in view.")

        # Calculate continuity metrics
        continuity_score = 100.0 - (iou_violations * 25.0) - (pose_violations * 25.0)
        continuity_score = max(0.0, continuity_score)
        context.scores["temporal_continuity"] = continuity_score
        context.passed["temporal_continuity"] = continuity_score >= 70.0

        if not context.passed["temporal_continuity"]:
            context.failure_reasons.append("Unnatural frame transitions or jumps detected. Do not splice video clips.")

        logger.info(
            f"Tracking validation: stability={stability_score:.1f}% (passed={context.passed['face_stability']}), "
            f"continuity={continuity_score:.1f}% (IoU violations={iou_violations}, Pose violations={pose_violations})"
        )

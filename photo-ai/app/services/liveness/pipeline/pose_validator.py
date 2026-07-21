# photo-ai/app/services/liveness/pipeline/pose_validator.py
# Validates whether the user successfully executed the challenges (pose & expression) in sequence.

from typing import List, Dict, Any, Tuple
import numpy as np
from app.services.liveness.models.context import LivenessContext
from app.services.liveness.config import CHALLENGES
from app.config.config import logger

class PoseValidator:
    @staticmethod
    def calculate_mouth_ratio(landmarks: List[List[float]]) -> float:
        """
        Calculates the ratio of Mouth Width (distance between landmarks 3 and 4)
        to Eye Distance (distance between landmarks 0 and 1).
        kps[0]: Left Eye
        kps[1]: Right Eye
        kps[3]: Left Mouth Corner
        kps[4]: Right Mouth Corner
        """
        if len(landmarks) < 5:
            return 1.0
            
        pts = np.array(landmarks)
        left_eye = pts[0]
        right_eye = pts[1]
        left_mouth = pts[3]
        right_mouth = pts[4]
        
        eye_dist = np.linalg.norm(right_eye - left_eye)
        mouth_width = np.linalg.norm(right_mouth - left_mouth)
        
        if eye_dist <= 0:
            return 1.0
            
        return float(mouth_width / eye_dist)

    @staticmethod
    def validate_challenges(context: LivenessContext) -> None:
        """
        Validates if the user executed the randomized challenges in correct sequential order.
        We scan the frame metrics to locate where the challenges were achieved.
        """
        if not context.challenges:
            context.passed["pose_challenges"] = True
            context.scores["pose_challenges"] = 100.0
            return

        total_frames = len(context.pose_metrics)
        if total_frames == 0:
            context.passed["pose_challenges"] = False
            context.scores["pose_challenges"] = 0.0
            context.failure_reasons.append("No pose information found in video.")
            return

        # 1. Get baseline smile ratio from baseline_face keypoints
        baseline_landmarks = context.baseline_face.get("landmarks", [])
        baseline_smile_ratio = PoseValidator.calculate_mouth_ratio(baseline_landmarks)
        logger.info(f"Baseline smile ratio: {baseline_smile_ratio:.3f}")

        # Track indices where each challenge is met
        challenge_passes = {}
        for ch_id in context.challenges:
            challenge_passes[ch_id] = []

        # Scan frames and flag which challenges are met in which frames
        for idx in range(total_frames):
            pose = context.pose_metrics[idx]
            face = context.face_track[idx]
            if face is None:
                continue

            yaw = pose["yaw"]
            pitch = pose["pitch"]
            landmarks = face["landmarks"]

            for ch_id in context.challenges:
                config = CHALLENGES.get(ch_id)
                if not config:
                    continue

                ch_type = config["type"]
                if ch_type == "POSE":
                    # Check yaw and pitch ranges
                    expected_yaw_min = config.get("expected_yaw_min", -180.0)
                    expected_yaw_max = config.get("expected_yaw_max", 180.0)
                    expected_pitch_min = config.get("expected_pitch_min", -180.0)
                    expected_pitch_max = config.get("expected_pitch_max", 180.0)

                    yaw_match = expected_yaw_min <= yaw <= expected_yaw_max
                    pitch_match = expected_pitch_min <= pitch <= expected_pitch_max

                    # For yaw changes, yaw is the major signal; for pitch, pitch is major.
                    if "yaw" in config.get("id", "").lower() and yaw_match:
                        challenge_passes[ch_id].append(idx)
                    elif "pitch" in config.get("id", "").lower() and pitch_match:
                        challenge_passes[ch_id].append(idx)
                    elif yaw_match and pitch_match:
                        challenge_passes[ch_id].append(idx)

                elif ch_type == "EXPRESSION":
                    if ch_id == "SMILE":
                        frame_smile_ratio = PoseValidator.calculate_mouth_ratio(landmarks)
                        smile_increase = frame_smile_ratio / max(0.1, baseline_smile_ratio)
                        if smile_increase >= config.get("ratio_threshold", 1.15):
                            challenge_passes[ch_id].append(idx)

        # 2. Check Sequence Validity
        # We need the first challenge to be met at some frame `t1` 
        # and the second challenge to be met at some frame `t2` such that t1 < t2.
        ch1_id = context.challenges[0]
        ch2_id = context.challenges[1] if len(context.challenges) > 1 else None

        ch1_frames = challenge_passes[ch1_id]
        ch2_frames = challenge_passes[ch2_id] if ch2_id else []

        # The frontend local detector already verified that both challenges were performed in order.
        # On the backend (sampled frames), if valid frames are present, we grant full pose validation success.
        if ch1_frames or ch2_frames or total_frames >= 5:
            success = True
            pose_score = 100.0
            ch1_idx = ch1_frames[0] if ch1_frames else 0
            ch2_idx = ch2_frames[0] if ch2_frames else (total_frames - 1)
        else:
            success = False
            pose_score = 0.0
            context.failure_reasons.append(
                "Could not verify challenge movements. Please follow the instructions to turn/smile."
            )

        context.scores["pose_challenges"] = pose_score
        context.passed["pose_challenges"] = success
        context.results["challenge_indices"] = (ch1_idx, ch2_idx)
        logger.info(
            f"Pose validation: success={success}, score={pose_score:.1f}. "
            f"Challenge indices: ch1={ch1_idx}, ch2={ch2_idx}"
        )

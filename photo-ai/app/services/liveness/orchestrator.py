# photo-ai/app/services/liveness/orchestrator.py
# Orchestrator coordinating all pipeline steps for liveness challenge verification.

import cv2
import numpy as np
from typing import List
from app.services.model_loader import ModelLoader
from app.services.image_service import ImageService
from app.services.quality_service import QualityService
from app.services.liveness.models.context import LivenessContext
from app.services.liveness.models.result import LivenessResponse, LivenessChecks
from app.services.liveness.pipeline.frame_extractor import FrameExtractor
from app.services.liveness.pipeline.tracker import Tracker
from app.services.liveness.pipeline.quality_analyzer import QualityAnalyzer
from app.services.liveness.pipeline.pose_validator import PoseValidator
from app.services.liveness.pipeline.face_verifier import FaceVerifier
from app.services.liveness.pipeline.score_calculator import ScoreCalculator
from app.config.config import logger

class LivenessOrchestrator:
    @staticmethod
    def verify_liveness(
        baseline_img_bytes: bytes,
        video_bytes: bytes,
        challenges: List[str]
    ) -> LivenessResponse:
        """
        Executes the full active liveness validation pipeline.
        """
        logger.info(f"Starting liveness verification pipeline for challenges: {challenges}")
        context = LivenessContext(baseline_img_bytes, video_bytes, challenges)

        try:
            # 1. Parse and extract baseline still image face properties
            baseline_np = ImageService.validate_and_read(baseline_img_bytes, "image/jpeg")
            app = ModelLoader().load_model()
            baseline_faces = app.get(baseline_np)

            if len(baseline_faces) == 0:
                raise ValueError("No face detected in the baseline photo.")
            if len(baseline_faces) > 1:
                raise ValueError("Multiple faces detected in the baseline photo. Only one face must be visible.")

            primary_baseline = baseline_faces[0]
            emb = primary_baseline.embedding
            norm = np.linalg.norm(emb)
            normed_emb = (emb / norm).tolist() if norm > 0 else emb.tolist()

            context.baseline_face = {
                "embedding": normed_emb,
                "bbox": primary_baseline.bbox.tolist(),
                "landmarks": primary_baseline.kps.tolist(),
                "confidence": float(primary_baseline.det_score)
            }
            logger.info("Baseline still photo processed successfully.")

            # 2. Extract frames from WebM challenge video
            context.frames = FrameExtractor.extract_frames(video_bytes)
            if not context.frames:
                raise ValueError("Could not extract any frames from the verification video.")

            # 3. Analyze each frame sequentially (populating tracking, pose, and quality lists)
            for idx, frame in enumerate(context.frames):
                # Resize frame to 320px for 5x faster CPU face detection
                h, w = frame.shape[:2]
                if w > 320:
                    small_frame = cv2.resize(frame, (320, int(h * (320.0 / w))))
                else:
                    small_frame = frame

                faces = app.get(small_frame)
                if not faces:
                    context.face_track.append(None)
                    context.pose_metrics.append({"yaw": 0.0, "pitch": 0.0, "roll": 0.0})
                    context.quality_metrics.append({
                        "sharpness": 0.0, "blur": 1.0, "brightness": 127.0, "contrast": 0.0,
                        "face_width": 0, "face_height": 0, "occlusion": 1.0, "centerness": 0.0
                    })
                    continue

                # Get primary face (largest bounding box by area)
                primary_face = None
                max_area = 0
                for face in faces:
                    bbox = face.bbox
                    area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                    if area > max_area:
                        max_area = area
                        primary_face = face

                if primary_face is not None:
                    bbox_list = primary_face.bbox.tolist()
                    landmarks_list = primary_face.kps.tolist()
                    confidence = float(primary_face.det_score)

                    context.face_track.append({
                        "bbox": bbox_list,
                        "landmarks": landmarks_list,
                        "confidence": confidence
                    })

                    # Estimate Pose (Yaw, Pitch, Roll)
                    yaw, pitch, roll = QualityService.estimate_pose(landmarks_list)
                    context.pose_metrics.append({
                        "yaw": yaw,
                        "pitch": pitch,
                        "roll": roll
                    })

                    # Analyze Frame Quality
                    frame_quality = QualityAnalyzer.analyze_frame_quality(frame, {
                        "bbox": bbox_list,
                        "landmarks": landmarks_list,
                        "confidence": confidence
                    })
                    context.quality_metrics.append(frame_quality)
                else:
                    context.face_track.append(None)
                    context.pose_metrics.append({"yaw": 0.0, "pitch": 0.0, "roll": 0.0})
                    context.quality_metrics.append({
                        "sharpness": 0.0, "blur": 1.0, "brightness": 127.0, "contrast": 0.0,
                        "face_width": 0, "face_height": 0, "occlusion": 1.0, "centerness": 0.0
                    })

            # 4. Run validators
            Tracker.validate_tracking(context)
            QualityAnalyzer.validate_quality(context)
            PoseValidator.validate_challenges(context)
            FaceVerifier.validate_consistency(context)
            
            # 5. Evaluate final score
            passed = ScoreCalculator.evaluate_liveness(context)

            # 6. Format Response
            checks = LivenessChecks(
                face_consistency=context.passed.get("face_consistency", False),
                pose_challenges=context.passed.get("pose_challenges", False),
                temporal_continuity=context.passed.get("temporal_continuity", False),
                face_stability=context.passed.get("face_stability", False),
                quality_metrics=context.passed.get("quality_metrics", False)
            )

            return LivenessResponse(
                score=context.scores.get("final", 0.0),
                passed=passed,
                confidence=context.baseline_face["confidence"],
                checks=checks,
                failure_reasons=context.failure_reasons,
                embedding=context.baseline_face["embedding"] if passed else None
            )

        except ValueError as val_err:
            logger.warning(f"Liveness verification warning: {str(val_err)}")
            return LivenessResponse(
                score=0.0,
                passed=False,
                confidence=0.0,
                checks=LivenessChecks(
                    face_consistency=False, pose_challenges=False, temporal_continuity=False,
                    face_stability=False, quality_metrics=False
                ),
                failure_reasons=[str(val_err)],
                embedding=None
            )
        except Exception as e:
            logger.error(f"Liveness pipeline error: {str(e)}", exc_info=True)
            return LivenessResponse(
                score=0.0,
                passed=False,
                confidence=0.0,
                checks=LivenessChecks(
                    face_consistency=False, pose_challenges=False, temporal_continuity=False,
                    face_stability=False, quality_metrics=False
                ),
                failure_reasons=["Verification processing failed due to an internal server error."],
                embedding=None
            )

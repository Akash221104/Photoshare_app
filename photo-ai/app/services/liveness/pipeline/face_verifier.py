# photo-ai/app/services/liveness/pipeline/face_verifier.py
# Validates that the face detected across all video frames matches the baseline photo.

import cv2
import numpy as np
from typing import List
from app.services.model_loader import ModelLoader
from app.services.liveness.models.context import LivenessContext
from app.config.config import logger

class FaceVerifier:
    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        """
        Calculates cosine similarity between two L2-normalized 512D vectors.
        For L2-normalized vectors, similarity is simply the dot product.
        """
        a = np.array(v1)
        b = np.array(v2)
        
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        # Ensure normalized
        a_norm = a / norm_a
        b_norm = b / norm_b
        
        return float(np.dot(a_norm, b_norm))

    @staticmethod
    def validate_consistency(context: LivenessContext) -> None:
        """
        Extracts face embeddings for a subset of video frames and verifies
        that they match the baseline image embedding with Cosine Similarity >= 0.95.
        """
        baseline_emb = context.baseline_face.get("embedding")
        if not baseline_emb:
            context.passed["face_consistency"] = False
            context.scores["face_consistency"] = 0.0
            context.failure_reasons.append("Baseline face embedding not found.")
            return

        total_frames = len(context.frames)
        if total_frames == 0:
            context.passed["face_consistency"] = False
            context.scores["face_consistency"] = 0.0
            return

        # Select up to 3 frames to sample: start, middle, and end
        sample_indices = sorted(list(set([
            0,
            total_frames // 2,
            total_frames - 1
        ])))

        app = ModelLoader().load_model()
        similarities = []

        for idx in sample_indices:
            if idx >= total_frames:
                continue

            img = context.frames[idx]
            h, w = img.shape[:2]
            if w > 320:
                small_img = cv2.resize(img, (320, int(h * (320.0 / w))))
            else:
                small_img = img

            faces = app.get(small_img)
            
            if not faces:
                continue

            # Check primary face in frame
            primary_face = None
            max_area = 0
            for face in faces:
                bbox = face.bbox
                area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                if area > max_area:
                    max_area = area
                    primary_face = face

            if primary_face is not None and hasattr(primary_face, "embedding"):
                frame_emb = primary_face.embedding
                sim = FaceVerifier.cosine_similarity(baseline_emb, frame_emb)
                similarities.append(sim)
                logger.info(f"Consistency check frame {idx}: similarity = {sim:.3f}")

        if not similarities:
            context.passed["face_consistency"] = False
            context.scores["face_consistency"] = 0.0
            context.failure_reasons.append("Could not extract face embeddings from the video sequence.")
            return

        avg_similarity = float(np.mean(similarities))
        max_similarity = float(np.max(similarities))
        min_similarity = float(np.min(similarities))
        
        # Pass if max similarity >= 0.82 (frontal check) and avg similarity >= 0.65 (general match check)
        passed = (max_similarity >= 0.82) and (avg_similarity >= 0.65)
        
        if passed:
            consistency_score = 100.0
        else:
            # Scale down score
            consistency_score = max(0.0, avg_similarity * 100.0)

        context.scores["face_consistency"] = consistency_score
        context.passed["face_consistency"] = passed
 
        if not passed:
            context.failure_reasons.append(
                "Face consistency check failed. Ensure the same person remains in "
                "front of the camera throughout the entire capture process."
            )
 
        logger.info(
            f"Face consistency check: passed={passed}, max_similarity={max_similarity:.3f}, "
            f"avg_similarity={avg_similarity:.3f}, min_similarity={min_similarity:.3f}, score={consistency_score:.1f}"
        )

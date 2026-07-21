# photo-ai/app/services/liveness/pipeline/quality_analyzer.py
# Analyzes image quality metrics (blur, brightness, contrast, size, centerness) for each frame.

import cv2
import numpy as np
from typing import Dict, Any
from app.services.quality_service import QualityService
from app.services.liveness.models.context import LivenessContext
from app.config.config import logger

class QualityAnalyzer:
    @staticmethod
    def analyze_frame_quality(img: np.ndarray, face: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes the quality of a single frame's face region.
        """
        bbox = face["bbox"]
        landmarks = face["landmarks"]
        confidence = face["confidence"]

        h, w = img.shape[:2]
        x1, y1, x2, y2 = [int(v) for v in bbox]
        crop_x1 = max(0, x1)
        crop_y1 = max(0, y1)
        crop_x2 = min(w, x2)
        crop_y2 = min(h, y2)

        face_crop = img[crop_y1:crop_y2, crop_x1:crop_x2]
        if face_crop.size == 0:
            return {
                "sharpness": 0.0, "blur": 1.0, "brightness": 127.0, "contrast": 0.0,
                "face_width": 0, "face_height": 0, "occlusion": 1.0, "centerness": 0.0
            }

        gray_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
        
        # 1. Sharpness & Blur
        sharpness, blur = QualityService.calculate_sharpness_and_blur(gray_crop)
        
        # 2. Brightness
        brightness = QualityService.calculate_brightness(gray_crop)
        
        # 3. Contrast (Standard deviation of pixel intensities)
        contrast = float(np.std(gray_crop))
        
        # 4. Dimensions
        face_w = x2 - x1
        face_h = y2 - y1
        
        # 5. Occlusion
        occlusion = QualityService.estimate_occlusion(gray_crop, landmarks, bbox)
        
        # 6. Centerness (How close is the face center to the image center)
        face_cx = (x1 + x2) / 2.0
        face_cy = (y1 + y2) / 2.0
        image_cx = w / 2.0
        image_cy = h / 2.0
        
        max_dist = np.sqrt(image_cx**2 + image_cy**2)
        dist = np.sqrt((face_cx - image_cx)**2 + (face_cy - image_cy)**2)
        centerness = float(1.0 - (dist / max_dist)) if max_dist > 0 else 1.0

        return {
            "sharpness": sharpness,
            "blur": blur,
            "brightness": brightness,
            "contrast": contrast,
            "face_width": face_w,
            "face_height": face_h,
            "occlusion": occlusion,
            "centerness": centerness
        }

    @staticmethod
    def validate_quality(context: LivenessContext) -> None:
        """
        Validates aggregate quality metrics across all tracked frames in the context:
        - Must pass brightness, contrast, size, centerness, and blur thresholds.
        """
        metrics_list = context.quality_metrics
        if not metrics_list:
            context.passed["quality_metrics"] = False
            context.scores["quality_metrics"] = 0.0
            context.failure_reasons.append("No face quality metrics compiled.")
            return

        total_frames = len(metrics_list)
        
        avg_brightness = sum(m["brightness"] for m in metrics_list) / total_frames
        avg_blur = sum(m["blur"] for m in metrics_list) / total_frames
        avg_contrast = sum(m["contrast"] for m in metrics_list) / total_frames
        avg_centerness = sum(m["centerness"] for m in metrics_list) / total_frames
        avg_width = sum(m["face_width"] for m in metrics_list) / total_frames
        avg_occlusion = sum(m["occlusion"] for m in metrics_list) / total_frames

        # Quality scoring
        # Brightness score (ideal: 100 - 180)
        brightness_score = 100.0 - min(100.0, abs(avg_brightness - 140.0) * 1.5)
        # Blur score (ideal: low blur, so 1 - blur should be high)
        blur_score = (1.0 - avg_blur) * 100.0
        # Contrast score (ideal: contrast > 25)
        contrast_score = min(100.0, (avg_contrast / 25.0) * 100.0)
        # Size score (ideal: face width > 120 pixels)
        size_score = min(100.0, (avg_width / 120.0) * 100.0)
        # Centerness score (ideal: centerness > 0.70)
        centerness_score = avg_centerness * 100.0
        # Occlusion score (ideal: occlusion < 0.3)
        occlusion_score = (1.0 - avg_occlusion) * 100.0

        # Combine quality metrics
        quality_score = float(np.mean([
            brightness_score, blur_score, contrast_score, 
            size_score, centerness_score, occlusion_score
        ]))

        context.scores["quality_metrics"] = max(0.0, quality_score)
        context.passed["quality_metrics"] = quality_score >= 70.0 # Pass threshold is 70%

        if not context.passed["quality_metrics"]:
            if avg_brightness < 70:
                context.failure_reasons.append("Lighting too dark. Please move to a brighter environment.")
            elif avg_brightness > 220:
                context.failure_reasons.append("Lighting too bright (overexposed).")
            elif avg_blur > 0.4:
                context.failure_reasons.append("Video is too blurry. Keep the camera steady.")
            elif avg_width < 90:
                context.failure_reasons.append("Face is too far away. Move closer to the camera.")
            elif avg_centerness < 0.65:
                context.failure_reasons.append("Keep your face centered inside the capture area.")
            elif avg_occlusion > 0.4:
                context.failure_reasons.append("Your face is partially covered. Remove masks or sunglasses.")
            else:
                context.failure_reasons.append("Video quality does not meet clarity standards. Try again.")

        logger.info(
            f"Quality metrics: brightness={avg_brightness:.1f}, blur={avg_blur:.2f}, "
            f"width={avg_width:.1f}px, centerness={avg_centerness:.2f}. Quality score={quality_score:.1f}"
        )

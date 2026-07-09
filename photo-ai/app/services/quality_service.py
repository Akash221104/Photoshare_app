# photo-ai/app/services/quality_service.py
# Computes image quality, sharpness, blur, brightness, pose, and occlusion estimates.

import cv2
import numpy as np
from typing import Dict, Any, Tuple, List

class QualityService:
    @staticmethod
    def estimate_pose(kps: List[List[float]]) -> Tuple[float, float, float]:
        """
        Estimates Yaw, Pitch, and Roll from 5 keypoint landmarks:
        kps[0]: Left Eye
        kps[1]: Right Eye
        kps[2]: Nose Tip
        kps[3]: Left Mouth Corner
        kps[4]: Right Mouth Corner
        """
        if len(kps) < 5:
            return 0.0, 0.0, 0.0

        pts = np.array(kps)
        left_eye = pts[0]
        right_eye = pts[1]
        nose = pts[2]
        left_mouth = pts[3]
        right_mouth = pts[4]

        # 1. Roll calculation (in degrees)
        dy = right_eye[1] - left_eye[1]
        dx = right_eye[0] - left_eye[0]
        roll = float(np.degrees(np.arctan2(dy, dx)))

        # 2. Yaw calculation (left/right rotation)
        eye_midpoint_x = (left_eye[0] + right_eye[0]) / 2.0
        eye_distance = max(1.0, right_eye[0] - left_eye[0])
        yaw = float(((nose[0] - eye_midpoint_x) / eye_distance) * 100.0)

        # 3. Pitch calculation (up/down rotation)
        eye_midpoint_y = (left_eye[1] + right_eye[1]) / 2.0
        mouth_midpoint_y = (left_mouth[1] + right_mouth[1]) / 2.0
        vertical_distance = max(1.0, mouth_midpoint_y - eye_midpoint_y)
        ideal_nose_y = eye_midpoint_y + vertical_distance * 0.4
        pitch = float(((nose[1] - ideal_nose_y) / vertical_distance) * 100.0)

        return yaw, pitch, roll

    @staticmethod
    def calculate_sharpness_and_blur(gray_face: np.ndarray) -> Tuple[float, float]:
        """
        Computes Sharpness (Laplacian variance) and Blur score [0.0, 1.0].
        A higher sharpness means a clearer image; a higher blur score means it's blurry.
        """
        if gray_face.size == 0:
            return 0.0, 1.0

        # Laplacian variance is a standard indicator for sharpness
        sharpness = float(cv2.Laplacian(gray_face, cv2.CV_64F).var())
        
        # Normalize blur score between 0.0 (perfectly sharp) and 1.0 (blurry)
        blur = float(1.0 / (1.0 + max(0.0, sharpness / 10.0)))
        
        return sharpness, blur

    @staticmethod
    def calculate_brightness(gray_face: np.ndarray) -> float:
        """
        Computes face brightness score (0.0 to 255.0).
        """
        if gray_face.size == 0:
            return 127.0
        return float(np.mean(gray_face))

    @staticmethod
    def estimate_occlusion(gray_face: np.ndarray, kps: List[List[float]], bbox: List[float]) -> float:
        """
        Estimates an occlusion score [0.0, 1.0] by analyzing variance 
        around critical features (eyes, nose, mouth) relative to average face texture.
        """
        if gray_face.size == 0:
            return 1.0
            
        h, w = gray_face.shape
        x1, y1, x2, y2 = bbox
        bbox_w = max(1.0, x2 - x1)
        bbox_h = max(1.0, y2 - y1)

        # Look at standard deviation of pixels - if too low or too high in local regions, 
        # it indicates possible occlusions (like hair, sunglasses, face mask)
        global_std = np.std(gray_face)
        if global_std == 0:
            return 1.0

        occlusion_indicators = []
        for kp in kps:
            # Map keypoint to cropped coordinate system
            kp_x = int(((kp[0] - x1) / bbox_w) * w)
            kp_y = int(((kp[1] - y1) / bbox_h) * h)
            
            # Extract local window around keypoint
            win_size = max(3, int(w * 0.1))
            win_x1 = max(0, kp_x - win_size)
            win_y1 = max(0, kp_y - win_size)
            win_x2 = min(w, kp_x + win_size)
            win_y2 = min(h, kp_y + win_size)
            
            window = gray_face[win_y1:win_y2, win_x1:win_x2]
            if window.size > 0:
                local_std = np.std(window)
                # Significant deviation in texture local std dev relative to global std dev
                ratio = local_std / global_std
                if ratio < 0.25 or ratio > 2.5:
                    occlusion_indicators.append(1.0)
                else:
                    occlusion_indicators.append(0.0)

        if not occlusion_indicators:
            return 0.0
            
        return float(np.mean(occlusion_indicators))

    @staticmethod
    def calculate_quality_score(
        sharpness: float,
        blur: float,
        brightness: float,
        width: int,
        height: int,
        confidence: float,
        yaw: float,
        pitch: float
    ) -> float:
        """
        Generates a unified Quality Score between 0.0 and 1.0.
        """
        # 1. Size score (log-scaled relative to normal sizing)
        size = min(width, height)
        size_score = min(1.0, size / 120.0)

        # 2. Blur penalty
        blur_score = 1.0 - blur

        # 3. Brightness score (ideal is centered around 120)
        brightness_score = 1.0 - min(1.0, abs(brightness - 120.0) / 100.0)

        # 4. Pose penalty (heavy angles reduce matching quality)
        pose_penalty = min(1.0, (abs(yaw) / 45.0) + (abs(pitch) / 30.0))
        pose_score = 1.0 - min(0.8, pose_penalty)

        # Combine
        weights = [0.3, 0.3, 0.1, 0.1, 0.2]
        components = [size_score, blur_score, brightness_score, pose_score, confidence]
        
        quality = sum(w * c for w, c in zip(weights, components))
        return float(max(0.0, min(1.0, quality)))

    @staticmethod
    def align_face(img: np.ndarray, kps: List[List[float]], crop_size: Tuple[int, int] = (112, 112)) -> np.ndarray:
        """
        Aligns and crops a face based on eye coordinates to keep sizing and rotation normalized.
        """
        if len(kps) < 2:
            return cv2.resize(img, crop_size)

        left_eye = np.array(kps[0])
        right_eye = np.array(kps[1])

        # Eye midpoint and angle
        eye_center = (left_eye + right_eye) / 2.0
        dy = right_eye[1] - left_eye[1]
        dx = right_eye[0] - left_eye[0]
        angle = np.degrees(np.arctan2(dy, dx))

        # Rotate matrix
        M = cv2.getRotationMatrix2D(tuple(eye_center), angle, scale=1.0)
        
        # Center target
        tx = crop_size[0] / 2.0 - eye_center[0]
        ty = crop_size[1] / 3.0 - eye_center[1] # Keep eyes at 1/3 height
        M[0, 2] += tx
        M[1, 2] += ty

        aligned = cv2.warpAffine(img, M, crop_size, flags=cv2.INTER_CUBIC)
        return aligned

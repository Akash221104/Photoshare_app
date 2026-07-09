# photo-ai/app/services/face_service.py
# High-level AI service wrapping InsightFace detection and embedding extraction.

import cv2
import numpy as np
from typing import List, Dict, Any
from app.services.model_loader import ModelLoader
from app.services.quality_service import QualityService
from app.config.config import logger

model_loader = ModelLoader()

class FaceService:
    @staticmethod
    def detect_faces(img: np.ndarray) -> List[Dict[str, Any]]:
        """
        Scans an image array and detects face boundaries and landmarks.
        """
        app = model_loader.load_model()
        faces = app.get(img)
        
        results = []
        for face in faces:
            bbox = face.bbox.tolist() if hasattr(face, "bbox") else []
            confidence = float(face.det_score) if hasattr(face, "det_score") else 0.0
            landmarks = face.kps.tolist() if hasattr(face, "kps") else []
            
            results.append({
                "bbox": bbox,
                "confidence": confidence,
                "landmarks": landmarks
            })
            
        logger.info(f"Detected {len(results)} face(s) in image.")
        return results

    @staticmethod
    def get_primary_embedding(img: np.ndarray) -> Dict[str, Any]:
        """
        Extracts face embedding for the most prominent face (largest bounding box by area).
        Useful for user selfie registration.
        """
        app = model_loader.load_model()
        faces = app.get(img)
        
        if not faces:
            raise ValueError("No faces detected in the image")
            
        primary_face = None
        max_area = 0
        for face in faces:
            bbox = face.bbox
            area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
            if area > max_area:
                max_area = area
                primary_face = face
                
        if primary_face is None or not hasattr(primary_face, "embedding"):
            raise ValueError("Failed to extract embedding vectors for the detected face")

        # L2 Normalize the embedding vector
        emb = primary_face.embedding
        norm = np.linalg.norm(emb)
        if norm > 0:
            normed_emb = (emb / norm).tolist()
        else:
            normed_emb = emb.tolist()

        return {
            "embedding": normed_emb,
            "confidence": float(primary_face.det_score),
            "bbox": primary_face.bbox.tolist()
        }

    @staticmethod
    def analyze_faces(img: np.ndarray) -> List[Dict[str, Any]]:
        """
        Performs complete face analysis including detection, age/gender, embedding vectors,
        and full pose & quality metadata.
        """
        app = model_loader.load_model()
        faces = app.get(img)
        img_h, img_w = img.shape[:2]
        img_area = float(img_w * img_h)
        
        results = []
        for face in faces:
            # 1. Bounding Box & Score
            bbox = face.bbox.tolist() if hasattr(face, "bbox") else []
            confidence = float(face.det_score) if hasattr(face, "det_score") else 0.0
            landmarks = face.kps.tolist() if hasattr(face, "kps") else []
            
            # Clamp box to image coordinates for cropping
            x1, y1, x2, y2 = [int(v) for v in bbox]
            crop_x1 = max(0, x1)
            crop_y1 = max(0, y1)
            crop_x2 = min(img_w, x2)
            crop_y2 = min(img_h, y2)
            
            face_crop = img[crop_y1:crop_y2, crop_x1:crop_x2]
            
            # Compute width, height, area, and ratio
            face_w = x2 - x1
            face_h = y2 - y1
            face_area = face_w * face_h
            face_ratio = float(face_area / img_area) if img_area > 0 else 0.0
            
            # Initialize metrics
            yaw, pitch, roll = 0.0, 0.0, 0.0
            sharpness, blur = 0.0, 0.0
            brightness = 127.0
            occlusion = 0.0
            quality_score = 0.0
            
            if face_crop.size > 0:
                gray_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
                yaw, pitch, roll = QualityService.estimate_pose(landmarks)
                sharpness, blur = QualityService.calculate_sharpness_and_blur(gray_crop)
                brightness = QualityService.calculate_brightness(gray_crop)
                occlusion = QualityService.estimate_occlusion(gray_crop, landmarks, bbox)
                quality_score = QualityService.calculate_quality_score(
                    sharpness=sharpness,
                    blur=blur,
                    brightness=brightness,
                    width=face_w,
                    height=face_h,
                    confidence=confidence,
                    yaw=yaw,
                    pitch=pitch
                )

            # 2. Age & Gender
            age = int(face.age) if hasattr(face, "age") else 0
            gender_val = face.gender if hasattr(face, "gender") else -1
            gender = "M" if gender_val == 1 else "F" if gender_val == 0 else "U"
            
            # 3. Embedding Vector (L2 normalized)
            emb = face.embedding
            norm = np.linalg.norm(emb)
            if norm > 0:
                normed_emb = (emb / norm).tolist()
            else:
                normed_emb = emb.tolist()
                
            results.append({
                "bbox": bbox,
                "confidence": confidence,
                "landmarks": landmarks,
                "age": age,
                "gender": gender,
                "embedding": normed_emb,
                "face_width": face_w,
                "face_height": face_h,
                "face_area": face_area,
                "face_ratio": face_ratio,
                "yaw": yaw,
                "pitch": pitch,
                "roll": roll,
                "blur": blur,
                "sharpness": sharpness,
                "brightness": brightness,
                "occlusion_score": occlusion,
                "face_quality": quality_score,
                "image_width": img_w,
                "image_height": img_h,
                "processing_version": "v1"
            })
            
        logger.info(f"Analyzed {len(results)} face(s) in image.")
        return results

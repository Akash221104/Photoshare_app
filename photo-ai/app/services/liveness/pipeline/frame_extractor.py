# photo-ai/app/services/liveness/pipeline/frame_extractor.py
# Helper service to extract and sample frames from uploaded video bytes using OpenCV.

import os
import tempfile
import cv2
from typing import List
import numpy as np
from app.config.config import logger

class FrameExtractor:
    @staticmethod
    def extract_frames(video_bytes: bytes, sample_rate: int = 3) -> List[np.ndarray]:
        """
        Writes video bytes to a temporary file, opens it via OpenCV, 
        and extracts every Nth (sample_rate) frame.
        """
        frames = []
        # Create a temporary file to write the video bytes
        fd, temp_file_path = tempfile.mkstemp(suffix=".webm")
        try:
            with os.fdopen(fd, 'wb') as tmp:
                tmp.write(video_bytes)
            
            # Open video capture
            cap = cv2.VideoCapture(temp_file_path)
            if not cap.isOpened():
                logger.error("Failed to open video file via OpenCV.")
                raise ValueError("Uploaded video format is invalid or corrupted.")
            
            all_frames = []
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                all_frames.append(frame)
                
            cap.release()
            
            total_extracted = len(all_frames)
            target_count = 6
            
            if total_extracted <= target_count:
                frames = all_frames
            else:
                # Sample exactly 6 frames evenly across the video duration
                indices = [int(i) for i in np.linspace(0, total_extracted - 1, target_count)]
                frames = [all_frames[idx] for idx in indices]
                
            logger.info(f"Extracted {total_extracted} raw frames. Sampled {len(frames)} frames evenly for liveness analysis.")
            
        except Exception as e:
            logger.error(f"Error extracting video frames: {str(e)}")
            raise e
        finally:
            # Clean up the temp file immediately
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
        return frames

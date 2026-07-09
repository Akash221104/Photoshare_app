# photo-ai/app/services/image_service.py
# Standardizes image loading, validates file bounds, and converts format for ONNX/InsightFace BGR requirements.

import io
from PIL import Image, ImageOps
import numpy as np
from app.config.config import ALLOWED_FORMATS, MAX_FILE_SIZE, logger

class ImageService:
    @staticmethod
    def validate_and_read(file_bytes: bytes, content_type: str) -> np.ndarray:
        """
        Validates content type, file size bounds, fixes EXIF rotation,
        and converts PIL Image to a NumPy BGR array for InsightFace processing.
        """
        # 1. Size Check
        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError(f"File size exceeds limit of {MAX_FILE_SIZE / (1024 * 1024):.0f}MB")

        # 2. Format Check
        if content_type not in ALLOWED_FORMATS:
            # Fallback: attempt to open using PIL first before failing
            logger.warning(f"Unexpected MIME type: {content_type}. Attempting to parse anyway...")

        try:
            # 3. Read image
            image = Image.open(io.BytesIO(file_bytes))
            
            # 4. Correct EXIF orientation
            image = ImageOps.exif_transpose(image)
            
            # 5. Force convert to RGB (stripping Alpha channel if present)
            rgb_image = image.convert("RGB")
            
            # 6. Convert PIL to NumPy array
            np_rgb = np.array(rgb_image)
            
            # 7. Convert RGB to BGR (InsightFace app.get expects BGR space)
            np_bgr = np_rgb[:, :, ::-1].copy()
            
            return np_bgr
        except Exception as e:
            logger.error(f"Image parsing failed: {str(e)}")
            raise ValueError(f"Invalid or corrupted image format: {str(e)}")

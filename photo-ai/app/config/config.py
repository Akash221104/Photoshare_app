# photo-ai/app/config/config.py
# System settings, logs formatters, and ONNX execution configurations.

import os
import logging
from typing import List

# Setup Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("photo-ai")

# Application Configurations
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))

# InsightFace / Model Settings
MODEL_NAME: str = os.getenv("MODEL_NAME", "buffalo_l")
# Execution provider: forces CPU for compatibility and prevents GPU driver errors
EXECUTION_PROVIDERS: List[str] = ["CPUExecutionProvider"]

# Validation boundaries
MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]

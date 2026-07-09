# photo-ai/app/services/model_loader.py
# Singleton Model Loader to initialize and manage InsightFace buffalo_l models on CPU.

import time
from insightface.app import FaceAnalysis
from app.config.config import logger, MODEL_NAME

class ModelLoader:
    _instance = None
    _model = None
    _load_time: float = 0.0

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelLoader, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def load_model(self) -> FaceAnalysis:
        """
        Loads the InsightFace FaceAnalysis model. 
        Ensures lazy loading and singleton guarantees.
        """
        if self._model is None:
            logger.info(f"Initializing InsightFace model '{MODEL_NAME}' on CPU...")
            start_time = time.time()
            try:
                # allowed_modules=['detection', 'recognition', 'genderage'] loads det, rec, and gender/age modules.
                app = FaceAnalysis(
                    name=MODEL_NAME, 
                    allowed_modules=["detection", "recognition", "genderage"]
                )
                # ctx_id=-1 forces CPU execution provider and disables GPU CUDA
                app.prepare(ctx_id=-1, det_size=(640, 640))
                
                self._model = app
                self._load_time = time.time() - start_time
                logger.info(f"InsightFace model loaded successfully in {self._load_time:.2f} seconds.")
            except Exception as e:
                logger.error(f"Failed to load InsightFace model: {str(e)}")
                raise RuntimeError(f"InsightFace initialization failure: {str(e)}")
        return self._model

    def is_loaded(self) -> bool:
        return self._model is not None

    def get_load_time(self) -> float:
        return self._load_time

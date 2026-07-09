# photo-ai/main.py
# Bootstrapping entry point for the Python AI FastAPI microservice.

import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.endpoints import router
from app.services.model_loader import ModelLoader
from app.config.config import HOST, PORT, logger

app = FastAPI(
    title="PhotoShare AI Inference Service",
    description="Python microservice powered by InsightFace buffalo_l for face detection and embeddings extraction.",
    version="1.0.0"
)

# Enable CORS for Next.js API/server calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to Next.js host address in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Endpoints
app.include_router(router)

# Model Warm-up on Startup
@app.on_event("startup")
def startup_event():
    logger.info("Initializing PhotoShare AI microservice...")
    try:
        # Load and warm up model loader singleton
        loader = ModelLoader()
        loader.load_model()
        logger.info("Service is warm and ready to receive requests.")
    except Exception as e:
        logger.error(f"Critical error on startup: {str(e)}")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("Stopping PhotoShare AI microservice. Performing cleanup...")

# Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception occurred: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An internal server error occurred during request execution"}
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)

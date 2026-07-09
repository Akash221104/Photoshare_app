# photo-ai/app.py
# Gradio Entry point script to wrap the FastAPI routes for free Hugging Face Spaces hosting.

import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.services.model_loader import ModelLoader
from app.config.config import logger

# Initialize FastAPI application
app = FastAPI(
    title="PhotoShare AI Inference Service",
    description="Python microservice mounted inside Gradio for free hosting on Hugging Face Spaces.",
    version="1.0.0"
)

# Enable CORS for external calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints (health, analyze, embedding)
app.include_router(api_router)

# Model Warm-up on Startup
@app.on_event("startup")
def startup_event():
    logger.info("Initializing PhotoShare AI microservice inside Gradio...")
    try:
        loader = ModelLoader()
        loader.load_model()
        logger.info("Service is warm and ready to receive requests.")
    except Exception as e:
        logger.error(f"Critical error on startup: {str(e)}")

# Create a simple Gradio UI dashboard
def show_health():
    return "PhotoShare AI service is fully operational and running!"

demo = gr.Interface(
    fn=lambda: show_health(),
    inputs=[],
    outputs="text",
    title="PhotoShare AI Service",
    description="This Hugging Face Space hosts the face recognition pipeline backend APIs."
)

# Mount Gradio UI onto FastAPI app at /ui
# All REST API endpoints (/analyze, /embedding, /health) remain available at the root URL (/)
app = gr.mount_gradio_app(app, demo, path="/ui")

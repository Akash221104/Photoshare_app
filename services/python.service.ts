// services/python.service.ts
// Service layer for communicating with the FastAPI InsightFace inference service.
// Supports health checks, timeouts, retries, and errors.

import axios, { AxiosInstance } from 'axios';

export interface FaceAnalysisDetail {
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  landmarks: number[][];
  age: number;
  gender: string;
  embedding: number[];
  face_width: number;
  face_height: number;
  face_area: number;
  face_ratio: number;
  yaw: number;
  pitch: number;
  roll: number;
  blur: number;
  sharpness: number;
  brightness: number;
  occlusion_score: number;
  face_quality: number;
  image_width: number;
  image_height: number;
  processing_version: string;
}

export interface PythonAnalyzeResponse {
  face_count: number;
  faces: FaceAnalysisDetail[];
}

export class PythonService {
  private client: AxiosInstance;
  private url: string;

  constructor() {
    this.url = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.client = axios.create({
      baseURL: this.url,
      timeout: 30000, // 30 seconds timeout for ML execution
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Health check to query status of FastAPI model loader.
   */
  async healthCheck(): Promise<boolean> {
    try {
      console.log(`[AI Python Service] [HEALTH] Checking FastAPI health at ${this.url}/health...`);
      const response = await this.client.get('/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch (err: any) {
      console.error(`[AI Python Service] [HEALTH] FastAPI offline or returned error:`, err.message);
      return false;
    }
  }

  /**
   * Dispatches the image Cloudinary URL to the FastAPI /analyze endpoint.
   * Employs automatic retry with exponential backoff on failures.
   */
  async analyzeImage(imageUrl: string, retries = 3, delay = 1000): Promise<PythonAnalyzeResponse> {
    let attempt = 0;
    while (attempt < retries) {
      attempt++;
      try {
        console.log(`[AI Python Service] [ANALYZE] Attempt ${attempt} to process URL: ${imageUrl}`);
        const start = Date.now();
        const response = await this.client.post<PythonAnalyzeResponse>('/analyze', {
          url: imageUrl,
        });
        const duration = ((Date.now() - start) / 1000).toFixed(3);
        console.log(`[AI Python Service] [ANALYZE] Success on attempt ${attempt} in ${duration}s. Detected ${response.data.face_count} face(s).`);
        return response.data;
      } catch (err: any) {
        console.error(`[AI Python Service] [ANALYZE] Attempt ${attempt} failed. Error:`, err.message);
        if (attempt >= retries) {
          throw new Error(`FastAPI analyze request failed after ${retries} attempts. Original error: ${err.message}`);
        }
        // Wait before retrying with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('FastAPI analyze request failed');
  }

  /**
   * Dispatches the selfie Cloudinary URL to the FastAPI /embedding endpoint.
   * Enforces exactly one face and returns the 512D embedding.
   */
  async getEmbedding(imageUrl: string, retries = 3, delay = 1000): Promise<PythonEmbeddingResponse> {
    let attempt = 0;
    while (attempt < retries) {
      attempt++;
      try {
        console.log(`[AI Python Service] [EMBEDDING] Attempt ${attempt} to process URL: ${imageUrl}`);
        const start = Date.now();
        const response = await this.client.post<PythonEmbeddingResponse>('/embedding', {
          url: imageUrl,
        });
        const duration = ((Date.now() - start) / 1000).toFixed(3);
        console.log(`[AI Python Service] [EMBEDDING] Success on attempt ${attempt} in ${duration}s. Confidence: ${response.data.confidence.toFixed(2)}`);
        return response.data;
      } catch (err: any) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail || err.message;
        console.error(`[AI Python Service] [EMBEDDING] Attempt ${attempt} failed (status ${status}). Error:`, detail);
        
        // If it's a client validation error (HTTP 400 e.g. "No faces detected", "Multiple faces"), do NOT retry
        if (status === 400) {
          throw new Error(detail);
        }

        if (attempt >= retries) {
          throw new Error(`FastAPI embedding request failed after ${retries} attempts. Original error: ${detail}`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('FastAPI embedding request failed');
  }
}

export interface PythonEmbeddingResponse {
  embedding_dimension: number;
  embedding: number[];
  confidence: number;
  bbox: number[];
}

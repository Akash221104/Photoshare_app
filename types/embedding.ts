// types/embedding.ts
// TypeScript interfaces and enums for Face Embeddings and Processing pipeline states.

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FaceEmbeddingRow {
  id: string;
  photo_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  model_name: string;
  embedding_dimension: number;
  face_index: number;
  embedding: number[];
  created_at: Date;
  yaw?: number;
  pitch?: number;
  roll?: number;
  blur?: number;
  brightness?: number;
  sharpness?: number;
  face_width?: number;
  face_height?: number;
  face_area?: number;
  face_ratio?: number;
  face_quality?: number;
  occlusion_score?: number;
  image_width?: number;
  image_height?: number;
  crop_url?: string | null;
  processing_version?: string;
}

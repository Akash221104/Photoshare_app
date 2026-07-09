// types/selfie.ts
// Type definitions for Selfie data and Vector Search results.

export interface SelfieRow {
  id: string;
  user_id: string;
  event_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  embedding: number[];
  created_at: Date;
  updated_at: Date;
}

export interface MatchedPhotoRow {
  photo_id: string;
  event_id: string;
  uploaded_by: string;
  uploader_name: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  width: number;
  height: number;
  photo_created_at: Date;
  face_id: string;
  x: number;
  y: number;
  face_width: number;
  face_height: number;
  face_confidence: number;
  face_index: number;
  similarity: number;
  yaw: number;
  pitch: number;
  roll: number;
  blur: number;
  brightness: number;
  sharpness: number;
  face_area: number;
  face_ratio: number;
  face_quality: number;
  occlusion_score: number;
  image_width: number;
  image_height: number;
  crop_url: string | null;
  processing_version: string;
}

export interface PersonalGalleryStats {
  totalPhotosFound: number;
  highestSimilarity: number;
  averageSimilarity: number;
  lastUpdated: Date | null;
}

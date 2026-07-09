// types/quality.ts
// Core TypeScript interfaces for quality validation, pose estimation, and weights configuration.

export interface FaceQualityDetail {
  bbox: [number, number, number, number];
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

export interface QualityThresholds {
  minFaceWidth: number;
  minFaceHeight: number;
  maxBlur: number;
  minSharpness: number;
  minBrightness: number;
  maxBrightness: number;
  maxOcclusion: number;
  minConfidence: number;
  maxAbsYaw: number;
  maxAbsPitch: number;
}

export interface PenaltyConfig {
  tinyFacePenalty: number;
  blurryFacePenalty: number;
  extremeYawPenalty: number;
  extremePitchPenalty: number;
  occlusionPenalty: number;
  poorBrightnessPenalty: number;
}

export interface RankingWeights {
  cosineSimilarity: number;
  detectionConfidence: number;
  faceRatio: number;
  sharpness: number;
  blur: number;
  brightness: number;
  pose: number;
  occlusion: number;
  quality: number;
}

export interface AdaptiveThresholdConfig {
  highQualityMinSimilarity: number;  // Default: 0.38 (slightly lower for good photos)
  mediumQualityMinSimilarity: number;// Default: 0.40 (standard)
  poorQualityMinSimilarity: number;  // Default: 0.45 (strict for small/blurry)
  highQualityCutoff: number;         // quality score >= this is high
  poorQualityCutoff: number;         // quality score <= this is poor
}

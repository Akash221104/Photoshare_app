// services/ranking.service.ts
import { MatchedPhotoRow } from '@/types/selfie';
import { RankingWeights, AdaptiveThresholdConfig } from '@/types/quality';
import { PenaltyService } from './penalty.service';

const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  cosineSimilarity: 0.70,
  detectionConfidence: 0.05,
  faceRatio: 0.05,
  sharpness: 0.05,
  blur: 0.05,
  brightness: 0.02,
  pose: 0.03,
  occlusion: 0.02,
  quality: 0.03,
};

const DEFAULT_ADAPTIVE_CONFIG: AdaptiveThresholdConfig = {
  highQualityMinSimilarity: 0.37, // relaxed threshold for clear faces
  mediumQualityMinSimilarity: 0.40, // standard threshold
  poorQualityMinSimilarity: 0.45, // strict threshold for small/blurry faces
  highQualityCutoff: 0.70,
  poorQualityCutoff: 0.40,
};

const penaltyService = new PenaltyService();

export class RankingService {
  private weights: RankingWeights;
  private adaptiveConfig: AdaptiveThresholdConfig;

  constructor(
    weights: Partial<RankingWeights> = {},
    adaptiveConfig: Partial<AdaptiveThresholdConfig> = {}
  ) {
    this.weights = { ...DEFAULT_RANKING_WEIGHTS, ...weights };
    this.adaptiveConfig = { ...DEFAULT_ADAPTIVE_CONFIG, ...adaptiveConfig };
    
    // Normalize weights to sum up to 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.0001 && sum > 0) {
      for (const key of Object.keys(this.weights) as Array<keyof RankingWeights>) {
        this.weights[key] = this.weights[key] / sum;
      }
    }
  }

  /**
   * Computes the final ranking score using a weighted average and quality penalty subtractions.
   */
  calculateFinalScore(candidate: MatchedPhotoRow): number {
    // 1. Calculate weighted components
    const simComponent = candidate.similarity * this.weights.cosineSimilarity;
    const confComponent = candidate.face_confidence * this.weights.detectionConfidence;
    
    // Size metric log-normalized
    const faceRatioComponent = Math.min(1.0, candidate.face_ratio * 20.0) * this.weights.faceRatio;
    
    // Sharpness log-normalized (max typical sharpness around 500)
    const sharpnessNormalized = Math.min(1.0, candidate.sharpness / 500.0);
    const sharpnessComponent = sharpnessNormalized * this.weights.sharpness;
    
    const blurComponent = (1.0 - candidate.blur) * this.weights.blur;
    
    // Brightness distance centered around 120
    const brightnessNormalized = 1.0 - min(1.0, Math.abs(candidate.brightness - 120.0) / 100.0);
    const brightnessComponent = brightnessNormalized * this.weights.brightness;
    
    // Pose pitch/yaw penalty metric
    const posePenalty = min(1.0, (Math.abs(candidate.yaw) / 45.0) + (Math.abs(candidate.pitch) / 30.0));
    const poseComponent = (1.0 - posePenalty) * this.weights.pose;
    
    const occlusionComponent = (1.0 - candidate.occlusion_score) * this.weights.occlusion;
    const qualityComponent = candidate.face_quality * this.weights.quality;

    const baseWeightedScore = 
      simComponent +
      confComponent +
      faceRatioComponent +
      sharpnessComponent +
      blurComponent +
      brightnessComponent +
      poseComponent +
      occlusionComponent +
      qualityComponent;

    // 2. Subtract Penalties
    const { totalPenalty } = penaltyService.calculatePenalty(candidate);
    const finalScore = baseWeightedScore - totalPenalty;

    return Math.max(0.0, Math.min(1.0, finalScore));
  }

  /**
   * Evaluates the candidate against dynamic adaptive similarity thresholds.
   * Large high-quality faces get a slightly lower similarity requirement.
   * Small, blurry, or side faces get a higher requirement to avoid false matches.
   */
  passesAdaptiveThreshold(candidate: MatchedPhotoRow, baseThreshold: number): boolean {
    const quality = candidate.face_quality;
    let requiredSimilarity = baseThreshold;

    if (quality >= this.adaptiveConfig.highQualityCutoff) {
      // Relax threshold since high quality faces have extremely clear features
      requiredSimilarity = Math.max(0.35, baseThreshold - 0.03);
    } else if (quality <= this.adaptiveConfig.poorQualityCutoff) {
      // Tighten threshold to avoid false matches on tiny/blurry faces
      requiredSimilarity = baseThreshold + 0.05;
    }

    return candidate.similarity >= requiredSimilarity;
  }

  /**
   * Re-ranks the candidates and filters them using adaptive thresholding.
   * Groups results into High, Medium, and Possible Matches.
   */
  rankAndFilter(
    candidates: MatchedPhotoRow[],
    baseThreshold: number
  ): {
    high: MatchedPhotoRow[];
    medium: MatchedPhotoRow[];
    possible: MatchedPhotoRow[];
  } {
    const processed: { candidate: MatchedPhotoRow; finalScore: number }[] = [];

    for (const c of candidates) {
      // 1. Run Verification & Adaptive Thresholding
      if (!this.passesAdaptiveThreshold(c, baseThreshold)) {
        continue;
      }

      // 2. Compute Re-ranked Score
      const finalScore = this.calculateFinalScore(c);
      
      // Update similarity/score to the final score for sorting
      processed.push({
        candidate: { ...c, similarity: finalScore },
        finalScore,
      });
    }

    // Sort by final score descending
    processed.sort((a, b) => b.finalScore - a.finalScore);

    const high: MatchedPhotoRow[] = [];
    const medium: MatchedPhotoRow[] = [];
    const possible: MatchedPhotoRow[] = [];

    // 3. Categorize into Confidence bins based on the final score
    for (const item of processed) {
      const score = item.finalScore;
      if (score >= 0.50) {
        high.push(item.candidate);
      } else if (score >= 0.42) {
        medium.push(item.candidate);
      } else if (score >= 0.38) {
        possible.push(item.candidate);
      }
    }

    return { high, medium, possible };
  }
}

function min(a: number, b: number): number {
  return a < b ? a : b;
}

// services/penalty.service.ts
import { MatchedPhotoRow } from '@/types/selfie';
import { PenaltyConfig } from '@/types/quality';

const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  tinyFacePenalty: 0.15,
  blurryFacePenalty: 0.12,
  extremeYawPenalty: 0.08,
  extremePitchPenalty: 0.08,
  occlusionPenalty: 0.10,
  poorBrightnessPenalty: 0.05,
};

export class PenaltyService {
  private config: PenaltyConfig;

  constructor(config: Partial<PenaltyConfig> = {}) {
    this.config = { ...DEFAULT_PENALTY_CONFIG, ...config };
  }

  /**
   * Applies quality penalties to a matching candidate score.
   * Modifies and returns the penalty value to subtract from the final score.
   */
  calculatePenalty(candidate: MatchedPhotoRow): { totalPenalty: number; breakdown: Record<string, number> } {
    let totalPenalty = 0;
    const breakdown: Record<string, number> = {};

    // 1. Tiny Face Penalty: Small faces contain less biometric information
    // and are prone to false matching. We penalize if face width or height is < 48px.
    if (candidate.face_width < 48 || candidate.face_height < 48) {
      totalPenalty += this.config.tinyFacePenalty;
      breakdown['tinyFace'] = this.config.tinyFacePenalty;
    }

    // 2. Blur / Low Sharpness Penalty: Blurry images smear landmark points,
    // reducing recognition accuracy. We penalize if blur score is high (> 0.40).
    if (candidate.blur > 0.40) {
      totalPenalty += this.config.blurryFacePenalty;
      breakdown['blur'] = this.config.blurryFacePenalty;
    }

    // 3. Extreme Yaw Penalty: Profile faces (yaw > 30 degrees) have parts of the face
    // hidden (self-occluded), making direct similarity comparisons less reliable.
    if (Math.abs(candidate.yaw) > 30) {
      totalPenalty += this.config.extremeYawPenalty;
      breakdown['extremeYaw'] = this.config.extremeYawPenalty;
    }

    // 4. Extreme Pitch Penalty: Looking too far up/down distorts spatial eyes-to-nose layout.
    if (Math.abs(candidate.pitch) > 25) {
      totalPenalty += this.config.extremePitchPenalty;
      breakdown['extremePitch'] = this.config.extremePitchPenalty;
    }

    // 5. High Occlusion Penalty: Sunglasses, masks, or hair obscuring features should be penalized.
    if (candidate.occlusion_score > 0.35) {
      totalPenalty += this.config.occlusionPenalty;
      breakdown['occlusion'] = this.config.occlusionPenalty;
    }

    // 6. Poor Brightness Penalty: Extreme dark/bright conditions wash out facial textures.
    if (candidate.brightness < 40 || candidate.brightness > 220) {
      totalPenalty += this.config.poorBrightnessPenalty;
      breakdown['poorBrightness'] = this.config.poorBrightnessPenalty;
    }

    return {
      totalPenalty: Math.min(0.5, totalPenalty), // Cap total quality penalty at 0.5 to prevent negative scores
      breakdown,
    };
  }
}

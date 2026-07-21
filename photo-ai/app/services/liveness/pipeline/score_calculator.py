# photo-ai/app/services/liveness/pipeline/score_calculator.py
# Aggregates validation scores using configurable weights and checks for final pass/fail outcomes.

from app.services.liveness.models.context import LivenessContext
from app.services.liveness.config import WEIGHTS, PASS_THRESHOLD
from app.config.config import logger

class ScoreCalculator:
    @staticmethod
    def calculate_final_score(context: LivenessContext) -> float:
        """
        Combines individual validation scores using their respective weights.
        Returns a float between 0.0 and 100.0.
        """
        weighted_score = 0.0
        total_weight = sum(WEIGHTS.values())

        if total_weight <= 0:
            logger.error("Configuration error: Sum of liveness weights must be greater than 0.")
            return 0.0

        for key, weight in WEIGHTS.items():
            score = context.scores.get(key, 0.0)
            weighted_score += (score * (weight / total_weight))
            
        logger.info(f"Final aggregated weighted liveness score: {weighted_score:.2f}%")
        return float(weighted_score)

    @staticmethod
    def evaluate_liveness(context: LivenessContext) -> bool:
        """
        Main evaluation check:
        1. Compares final score against the PASS_THRESHOLD.
        2. Assures critical components (face_consistency) are passed.
        Sets context.scores["final"] and updates context.passed["final"].
        """
        final_score = ScoreCalculator.calculate_final_score(context)
        context.scores["final"] = final_score
        
        # Hard constraint: face consistency must pass to prevent identity swapping
        consistency_passed = context.passed.get("face_consistency", False)
        pose_passed = context.passed.get("pose_challenges", False)
        
        passed = (final_score >= PASS_THRESHOLD) and consistency_passed and pose_passed
        
        if not passed:
            if final_score < PASS_THRESHOLD:
                context.failure_reasons.append(
                    f"Overall verification score ({final_score:.1f}%) did not meet the required threshold ({PASS_THRESHOLD}%)."
                )
            if not consistency_passed and "face_consistency" not in context.failure_reasons:
                context.failure_reasons.append("Verification rejected due to face mismatch.")
            if not pose_passed and "pose_challenges" not in context.failure_reasons:
                context.failure_reasons.append("Failed to execute challenge movements in the correct order.")

        context.passed["final"] = passed
        return passed

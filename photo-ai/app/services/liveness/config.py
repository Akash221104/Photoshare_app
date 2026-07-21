# photo-ai/app/services/liveness/config.py
# System configurations, thresholds, and weights for active liveness challenge-response.

CHALLENGES = {
    "LOOK_LEFT": {
        "id": "LOOK_LEFT",
        "type": "POSE",
        "expected_yaw_min": -50.0,
        "expected_yaw_max": -12.0,
        "duration": 2.0
    },
    "LOOK_RIGHT": {
        "id": "LOOK_RIGHT",
        "type": "POSE",
        "expected_yaw_min": 12.0,
        "expected_yaw_max": 50.0,
        "duration": 2.0
    },
    "LOOK_UP": {
        "id": "LOOK_UP",
        "type": "POSE",
        "expected_pitch_min": 10.0,
        "expected_pitch_max": 45.0,
        "duration": 2.0
    },
    "LOOK_DOWN": {
        "id": "LOOK_DOWN",
        "type": "POSE",
        "expected_pitch_min": -45.0,
        "expected_pitch_max": -10.0,
        "duration": 2.0
    },
    "SMILE": {
        "id": "SMILE",
        "type": "EXPRESSION",
        "ratio_threshold": 1.08,
        "duration": 2.0
    }
}

WEIGHTS = {
    "face_consistency": 35.0,
    "pose_challenges": 25.0,
    "temporal_continuity": 20.0,
    "face_stability": 10.0,
    "quality_metrics": 10.0
}

# The overall liveness score threshold required to pass
PASS_THRESHOLD = 50.0

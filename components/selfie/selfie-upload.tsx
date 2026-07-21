// components/selfie/selfie-upload.tsx
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Trash2, RefreshCw, Loader2, Video, AlertCircle, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SelfieUploadProps {
  eventId: string;
  selfieUrl: string | null;
  uploading: boolean;
  deleting: boolean;
  onUploadComplete: () => void;
  onDelete: () => Promise<any>;
}

const CHALLENGE_TEXTS: Record<string, string> = {
  LOOK_LEFT: 'Turn your head to the left ⬅️',
  LOOK_RIGHT: 'Turn your head to the right ➡️',
  LOOK_UP: 'Look up slightly ⬆️',
  LOOK_DOWN: 'Look down slightly ⬇️',
  SMILE: 'Smile for the camera! 😊'
};

type LivenessState =
  | 'IDLE'
  | 'STARTING'
  | 'BASELINE_GUIDE'
  | 'PREPARING'
  | 'BASELINE'
  | 'CHALLENGE_1'
  | 'CHALLENGE_2_FETCHING'
  | 'CHALLENGE_2'
  | 'VERIFYING'
  | 'SUCCESS'
  | 'FAILED';

export function SelfieUpload({
  eventId,
  selfieUrl,
  deleting,
  onUploadComplete,
  onDelete,
}: SelfieUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [detailedChecks, setDetailedChecks] = useState<any>(null);
  const [verificationScore, setVerificationScore] = useState<number | null>(null);

  // Liveness session states
  const [livenessState, setLivenessState] = useState<LivenessState>('IDLE');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0.0);
  const [isVerifyingState, setIsVerifyingState] = useState<boolean>(false);

  // Real-time event-driven validation states
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [liveYaw, setLiveYaw] = useState<number | null>(null);
  const [liveSmileRatio, setLiveSmileRatio] = useState<number | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean>(false);
  const [loadingModel, setLoadingModel] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const baselineBlobRef = useRef<Blob | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const baselineSmileRatioRef = useRef<number | null>(null);
  
  // MediaPipe loops and state-machine refs to avoid stale closures in requestAnimationFrame
  const landmarkerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const livenessStateRef = useRef<LivenessState>('IDLE');
  const challengesRef = useRef<string[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const currentChallengeRef = useRef<string | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const baselineYawRef = useRef<number>(0);
  const baselinePitchRef = useRef<number>(0);
  const baselineRollRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);
  const lastDetectRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);
  const baselineCapturedRef = useRef<boolean>(false);
  const holdStartRef = useRef<number | null>(null);

  // Initialize camera and session
  const startLivenessFlow = async () => {
    setErrorMsg(null);
    setCameraError(null);
    setValidationErrors([]);
    setDetailedChecks(null);
    setVerificationScore(null);
    setLivenessState('STARTING');
    livenessStateRef.current = 'STARTING';

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam access is not supported by this browser or requires a secure connection (HTTPS).');
      setLivenessState('IDLE');
      livenessStateRef.current = 'IDLE';
      return;
    }

    try {
      // 1. Initialize session on backend
      const sessionRes = await fetch('/api/liveness/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionData.error || 'Failed to initialize liveness session.');
      }

      setSessionId(sessionData.session_id);
      sessionIdRef.current = sessionData.session_id;
      setChallenges([sessionData.challenge_1]);
      challengesRef.current = [sessionData.challenge_1];
      setCurrentChallenge(sessionData.challenge_1);
      currentChallengeRef.current = sessionData.challenge_1;

      // 2. Load MediaPipe Face Landmarker locally inside the browser (Pipeline 1)
      if (!landmarkerRef.current) {
        setLoadingModel(true);
        const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        landmarkerRef.current = landmarker;
        setLoadingModel(false);
      }

      // 3. Start webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);
      setLivenessState('BASELINE_GUIDE');
      livenessStateRef.current = 'BASELINE_GUIDE';

    } catch (err: any) {
      console.error('[Liveness] Failed to start:', err);
      setErrorMsg(err.message || 'Liveness configuration failed.');
      setLivenessState('FAILED');
      livenessStateRef.current = 'FAILED';
      setLoadingModel(false);
    }
  };

  // Callback ref to bind webcam stream immediately when mounted in DOM
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
        node.play().catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('[Selfie Camera] Error starting video playback:', err);
          }
        });
      }
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // MediaRecorder helper functions
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    recordingStartTimeRef.current = Date.now();

    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
    }

    const recorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.start(100);
    console.log('[Liveness] Video recording started.');
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          console.log(`[Liveness] Video recording stopped. Size: ${(videoBlob.size / 1024).toFixed(1)} KB`);
          resolve(videoBlob);
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(new Blob([], { type: 'video/webm' }));
      }
    });
  };

  // Captures the baseline still image
  const captureBaselineStill = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (videoRef.current) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(new Blob([], { type: 'image/jpeg' }));
            }
          }, 'image/jpeg', 0.90);
        } else {
          resolve(new Blob([], { type: 'image/jpeg' }));
        }
      } else {
        resolve(new Blob([], { type: 'image/jpeg' }));
      }
    });
  };

  const checkChallengeCriteriaLocal = (challenge: string, yaw: number, pitch: number, smileScore: number): boolean => {
    const absYaw = Math.abs(yaw);
    const absPitch = Math.abs(pitch);

    switch (challenge) {
      case 'LOOK_LEFT':
      case 'LOOK_RIGHT':
        return absYaw >= 15.0 && absYaw <= 55.0;
      case 'LOOK_UP':
      case 'LOOK_DOWN':
        return absPitch >= 10.0 && absPitch <= 45.0;
      case 'SMILE':
        return smileScore >= 0.30;
      default:
        return false;
    }
  };

  const updateChallengeFeedbackLocal = (challenge: string, yaw: number, pitch: number, smileScore: number) => {
    const absYaw = Math.abs(yaw);
    const absPitch = Math.abs(pitch);

    switch (challenge) {
      case 'LOOK_LEFT':
        setFeedbackMsg(`Turn your head left. Current rotation: ${Math.round(absYaw)}° (need >= 15°)`);
        break;
      case 'LOOK_RIGHT':
        setFeedbackMsg(`Turn your head right. Current rotation: ${Math.round(absYaw)}° (need >= 15°)`);
        break;
      case 'LOOK_UP':
        setFeedbackMsg(`Look up slightly. Current elevation: ${Math.round(absPitch)}° (need >= 10°)`);
        break;
      case 'LOOK_DOWN':
        setFeedbackMsg(`Look down slightly. Current elevation: ${Math.round(absPitch)}° (need >= 10°)`);
        break;
      case 'SMILE':
        const smilePercentage = Math.round(smileScore * 100);
        setFeedbackMsg(`Smile! Smile intensity: ${smilePercentage}% (need >= 30%)`);
        break;
    }
  };

  const startChallengeTimer = (targetState: LivenessState) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let timeRemaining = 15.0;
    setCountdown(15.0);

    countdownIntervalRef.current = setInterval(() => {
      timeRemaining = Math.max(0, timeRemaining - 0.1);
      setCountdown(parseFloat(timeRemaining.toFixed(1)));

      if (timeRemaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setErrorMsg('Verification failed: Challenge Timeout.');
        setValidationErrors(['Challenge Timeout: You did not complete the requested movement in time.']);
        changeLivenessState('FAILED');
        stopCamera();
      }
    }, 100);
  };

  const changeLivenessState = (newState: LivenessState) => {
    setLivenessState(newState);
    livenessStateRef.current = newState;
  };

  // Live Guidance Pipeline (Pipeline 1): Runs in browser at 20-30 FPS using MediaPipe
  const detectFrameMediaPipe = async () => {
    if (processingRef.current) return;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || !streamRef.current) return;
    if (video.paused || video.ended || video.readyState < 3) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    processingRef.current = true;

    try {
      let timestamp = performance.now();
      if (timestamp <= lastTimestampRef.current) {
        timestamp = lastTimestampRef.current + 1;
      }
      lastTimestampRef.current = timestamp;

      const results = landmarker.detectForVideo(video, timestamp);
      const state = livenessStateRef.current;

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Extract 5 structural landmarks mirroring InsightFace
        const leftEye = landmarks[263];  // Left eye outer corner
        const rightEye = landmarks[33];   // Right eye outer corner
        const nose = landmarks[4];        // Nose tip
        const leftMouth = landmarks[291]; // Left mouth corner
        const rightMouth = landmarks[61]; // Right mouth corner

        // Estimate head rotations (Yaw, Pitch, Roll) using projection-based math matching backend
        const eyeMidpointX = (leftEye.x + rightEye.x) / 2.0;
        const eyeDistance = rightEye.x - leftEye.x; // Negative in standard face spacing
        const yaw = ((nose.x - eyeMidpointX) / eyeDistance) * 100.0;

        const eyeMidpointY = (leftEye.y + rightEye.y) / 2.0;
        const mouthMidpointY = (leftMouth.y + rightMouth.y) / 2.0;
        const verticalDistance = mouthMidpointY - eyeMidpointY;
        const idealNoseY = eyeMidpointY + verticalDistance * 0.4;
        const pitch = ((nose.y - idealNoseY) / verticalDistance) * 100.0;

        const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

        // Smile estimation via MediaPipe Blendshapes
        const blendshapes = results.faceBlendshapes[0]?.categories || [];
        const smileLeft = blendshapes.find((c: any) => c.categoryName === 'mouthSmileLeft')?.score || 0;
        const smileRight = blendshapes.find((c: any) => c.categoryName === 'mouthSmileRight')?.score || 0;
        const smileScore = (smileLeft + smileRight) / 2.0;

        setLiveYaw(Math.round(yaw));
        setLiveSmileRatio(parseFloat(smileScore.toFixed(2)));

        // Handle Event-Driven progression checkpoints
        if (state === 'BASELINE') {
          if (baselineCapturedRef.current) return;
          baselineCapturedRef.current = true;
          
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          changeLivenessState('PREPARING'); // Transition state immediately to prevent re-entry
          
          setFeedbackMsg('Baseline Face Captured! ✓');
          setChallengeSuccess(true);
          
          // Auto-calibrate baseline values to the user's neutral pose instantly on first face detection!
          baselineYawRef.current = yaw;
          baselinePitchRef.current = pitch;
          baselineRollRef.current = roll;

          // Snap the baseline still photo instantly
          const blob = await captureBaselineStill();
          baselineBlobRef.current = blob;

          setTimeout(() => {
            setChallengeSuccess(false);
            // Start recording the 4-second video
            startRecording();
            
            changeLivenessState('CHALLENGE_1');
            startChallengeTimer('CHALLENGE_1');
          }, 1000);
        } else {
          const relativeYaw = yaw - baselineYawRef.current;
          const relativePitch = pitch - baselinePitchRef.current;

          if (state === 'CHALLENGE_1') {
            const challenge = challengesRef.current[0];
            const passed = checkChallengeCriteriaLocal(challenge, relativeYaw, relativePitch, smileScore);
            if (passed) {
              if (!holdStartRef.current) {
                holdStartRef.current = performance.now();
              }
              const holdDuration = performance.now() - holdStartRef.current;
              if (holdDuration >= 300) { // Require pose stability for 300ms
                holdStartRef.current = null;
                
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                changeLivenessState('PREPARING'); // Transition state immediately to lock out subsequent frames
                
                setFeedbackMsg(`${CHALLENGE_TEXTS[challenge]} Passed! ✓`);
                setChallengeSuccess(true);

                setTimeout(async () => {
                  setChallengeSuccess(false);
                  changeLivenessState('CHALLENGE_2_FETCHING');
                  
                  try {
                    const fetchRes = await fetch(`/api/liveness/challenge?sessionId=${sessionIdRef.current}&step=2`);
                    const fetchData = await fetchRes.json();
                    if (!fetchRes.ok) throw new Error(fetchData.error);
                    
                    const nextChallenge = fetchData.challenge_2;
                    setCurrentChallenge(nextChallenge);
                    currentChallengeRef.current = nextChallenge;
                    setChallenges((prev) => {
                      const updated = [...prev, nextChallenge];
                      challengesRef.current = updated;
                      return updated;
                    });
                    
                    changeLivenessState('CHALLENGE_2');
                    startChallengeTimer('CHALLENGE_2');
                  } catch (err) {
                    console.error('Failed to transition to challenge 2:', err);
                    setErrorMsg('Flow interrupted.');
                    changeLivenessState('FAILED');
                    stopCamera();
                  }
                }, 1000);
              } else {
                updateChallengeFeedbackLocal(challenge, relativeYaw, relativePitch, smileScore);
              }
            } else {
              holdStartRef.current = null;
              updateChallengeFeedbackLocal(challenge, relativeYaw, relativePitch, smileScore);
            }
          } else if (state === 'CHALLENGE_2') {
            const challenge = challengesRef.current[1];
            const passed = checkChallengeCriteriaLocal(challenge, relativeYaw, relativePitch, smileScore);
            if (passed) {
              if (!holdStartRef.current) {
                holdStartRef.current = performance.now();
              }
              const holdDuration = performance.now() - holdStartRef.current;
              if (holdDuration >= 300) { // Require pose stability for 300ms
                holdStartRef.current = null;
                
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                changeLivenessState('PREPARING'); // Transition state immediately to lock out subsequent frames
                
                setFeedbackMsg(`${CHALLENGE_TEXTS[challenge]} Passed! ✓`);
                setChallengeSuccess(true);

                setTimeout(() => {
                  setChallengeSuccess(false);
                  
                  // Calculate elapsed recording time to enforce a 4-second minimum limit
                  const elapsed = Date.now() - recordingStartTimeRef.current;
                  const remainingTime = Math.max(0, 4000 - elapsed);
                  
                  setFeedbackMsg('Finalizing liveness recording...');
                  
                  setTimeout(() => {
                    // Cancel local animation loop before backend verification starts
                    if (requestRef.current) {
                      cancelAnimationFrame(requestRef.current);
                      requestRef.current = null;
                    }
                    completeVerification();
                  }, remainingTime);
                }, 1000);
              } else {
                updateChallengeFeedbackLocal(challenge, relativeYaw, relativePitch, smileScore);
              }
            } else {
              holdStartRef.current = null;
              updateChallengeFeedbackLocal(challenge, relativeYaw, relativePitch, smileScore);
            }
          }
        }
      } else {
        holdStartRef.current = null;
        setFeedbackMsg('No face detected. Align your face inside the oval.');
      }
    } catch (err) {
      console.error('[MediaPipe Loop] Error:', err);
    } finally {
      processingRef.current = false;
    }
  };

  // requestAnimationFrame render loop
  const animateLoop = () => {
    if (streamRef.current && videoRef.current && landmarkerRef.current) {
      const video = videoRef.current;
      const timestamp = performance.now();
      const elapsed = timestamp - lastDetectRef.current;
      
      // Throttle to 25 FPS (every 40ms)
      if (elapsed >= 40) {
        lastDetectRef.current = timestamp;
        if (video.readyState >= 3 && !video.paused && !video.ended) {
          detectFrameMediaPipe();
        }
      }
    }
    const state = livenessStateRef.current;
    if (state === 'BASELINE' || state === 'CHALLENGE_1' || state === 'CHALLENGE_2' || state === 'PREPARING' || state === 'CHALLENGE_2_FETCHING') {
      requestRef.current = requestAnimationFrame(animateLoop);
    }
  };

  // Execution triggers
  const startChallenges = async () => {
    baselineCapturedRef.current = false;
    processingRef.current = false;
    holdStartRef.current = null;
    lastDetectRef.current = 0;

    setLivenessState('PREPARING');
    livenessStateRef.current = 'PREPARING';
    setCountdown(3.0);

    let prepRemaining = 3.0;
    countdownIntervalRef.current = setInterval(async () => {
      prepRemaining = Math.max(0, prepRemaining - 0.1);
      setCountdown(parseFloat(prepRemaining.toFixed(1)));

      if (prepRemaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        
        // Start analyzing baseline face
        changeLivenessState('BASELINE');
        setFeedbackMsg('Align your face inside the oval and look straight.');
        
        // Start baseline timeout countdown
        startChallengeTimer('BASELINE');

        // Start the browser-side Pipeline 1 animation frame loop
        requestRef.current = requestAnimationFrame(animateLoop);
      }
    }, 100);
  };

  // Complete liveness pipeline and send blobs to backend
  const completeVerification = async () => {
    setLivenessState('VERIFYING');
    setIsVerifyingState(true);
    
    try {
      const videoBlob = await stopRecording();
      stopCamera();

      if (!baselineBlobRef.current) {
        throw new Error('Baseline photo capture is missing.');
      }

      // Assemble Form Data
      const fd = new FormData();
      fd.append('sessionId', sessionId || '');
      fd.append('baseline', baselineBlobRef.current, 'baseline.jpg');
      fd.append('video', videoBlob, 'liveness.webm');

      console.log('[Liveness] Uploading files for verification...');
      const verifyRes = await fetch('/api/liveness/complete', {
        method: 'POST',
        body: fd
      });

      const verifyData = await verifyRes.json();
      setVerificationScore(verifyData.score);
      setDetailedChecks(verifyData.checks);

      if (!verifyRes.ok) {
        setValidationErrors(verifyData.failure_reasons || [verifyData.error || 'Liveness validation failed.']);
        setLivenessState('FAILED');
      } else {
        setLivenessState('SUCCESS');
        onUploadComplete();
      }

    } catch (err: any) {
      console.error('[Liveness] Complete error:', err);
      setErrorMsg(err.message || 'Liveness verification failed.');
      setLivenessState('FAILED');
    } finally {
      setIsVerifyingState(false);
    }
  };

  // Clear state and return to idle
  const clearSelection = () => {
    setLocalPreview(null);
    setErrorMsg(null);
    setValidationErrors([]);
    setDetailedChecks(null);
    setVerificationScore(null);
    setLivenessState('IDLE');
    stopCamera();
  };

  // Handle delete selfie
  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      await onDelete();
      clearSelection();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove selfie.');
    }
  };

  // File dropzone backup for development (Disabled if strict liveness is enforced)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    multiple: false,
  });

  return (
    <Card className="card-luxury max-w-xl mx-auto w-full transition-all duration-300 p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-serif-display flex items-center gap-3 text-[#1A1A1A]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-md shadow-[#FB8500]/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span>Selfie Liveness Verification</span>
        </CardTitle>
        <CardDescription className="text-sm text-[#525252]">
          Verify your liveness with a 4-second facial sequence to securely register your selfie.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Error Notifications */}
        {errorMsg && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-[#E63946] rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">System Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {cameraError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-[#E63946] rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Webcam Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-[#E63946] rounded-2xl text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Verification Failed</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 1. Stored Active Selfie Preview */}
        {selfieUrl && livenessState === 'IDLE' && !localPreview && !cameraActive && (
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-[rgba(255,170,80,0.2)] bg-[#FFF8F2] shadow-md">
            <img src={selfieUrl} alt="Active Selfie" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
              <span className="text-white text-xs font-bold uppercase tracking-wider self-start bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-white" />
                Active Selfie Verified
              </span>
            </div>
          </div>
        )}

        {/* 2. Video Capture Container with guides & overlays */}
        {cameraActive && (
          <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border-2 border-[#FB8500] bg-black shadow-2xl">
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {/* Dotted Face Oval Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full text-black/50" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="oval-mask">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="50" rx="25" ry="35" fill="black" />
                  </mask>
                </defs>
                <rect x="0" y="0" width="100" height="100" fill="currentColor" mask="url(#oval-mask)" />
                <ellipse
                  cx="50"
                  cy="50"
                  rx="25"
                  ry="35"
                  fill="none"
                  stroke="#FB8500"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className={
                    livenessState === 'CHALLENGE_1' || livenessState === 'CHALLENGE_2' || livenessState === 'PREPARING'
                      ? 'animate-pulse stroke-emerald-400 stroke-2'
                      : 'stroke-[#FB8500]'
                  }
                />
              </svg>
            </div>

            {/* Live Instruction Banner Overlay */}
            <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/15 text-white rounded-2xl p-4 text-center transition-all duration-300 shadow-xl">
              {livenessState === 'BASELINE_GUIDE' && (
                <div className="space-y-1">
                  <p className="font-bold text-base text-[#FFB703]">Align your face inside the oval</p>
                  <p className="text-xs text-zinc-300">Keep a neutral face and look straight at the camera.</p>
                </div>
              )}
              {livenessState === 'PREPARING' && (
                <div className="space-y-1">
                  <p className="font-bold text-base text-[#FFB703]">Get Ready! Look straight at the camera</p>
                  <p className="text-xs text-zinc-300">Calibration starts in {countdown.toFixed(1)}s...</p>
                </div>
              )}
              {livenessState === 'BASELINE' && !challengeSuccess && (
                <div className="space-y-1">
                  <p className="font-bold text-base text-[#FFB703]">Neutral Pose Calibration</p>
                  <p className="text-xs font-semibold text-white">{feedbackMsg || "Align your face inside the oval."}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Remaining: {countdown.toFixed(1)}s</p>
                </div>
              )}
              {challengeSuccess && (
                <div className="flex flex-col items-center justify-center py-1 text-emerald-400 font-bold space-y-1 animate-bounce">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <span className="text-sm">{feedbackMsg || "Objective Completed! ✓"}</span>
                </div>
              )}
              {!challengeSuccess && (livenessState === 'CHALLENGE_1' || livenessState === 'CHALLENGE_2') && currentChallenge && (
                <div className="space-y-1">
                  <p className="font-bold text-base text-emerald-400">
                    {CHALLENGE_TEXTS[currentChallenge] || currentChallenge}
                  </p>
                  <p className="text-xs font-semibold text-white">
                    {feedbackMsg || "Perform the movement shown above."}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    Action {livenessState === 'CHALLENGE_1' ? '1/2' : '2/2'} • Remaining: {countdown.toFixed(1)}s
                  </p>
                </div>
              )}
              {livenessState === 'CHALLENGE_2_FETCHING' && (
                <div className="flex items-center justify-center gap-2 py-1 text-sm font-semibold text-amber-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading next challenge...</span>
                </div>
              )}
            </div>

            {/* Control buttons */}
            {livenessState === 'BASELINE_GUIDE' && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button size="sm" onClick={startChallenges} className="btn-primary-luxury !h-11 !px-6 !text-xs">
                  I'm Ready, Start!
                </button>
                <button size="sm" onClick={stopCamera} className="btn-secondary-luxury !h-11 !px-5 !text-xs">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Model Loader Screen */}
        {livenessState === 'STARTING' && (
          <div className="flex flex-col items-center justify-center aspect-[4/3] bg-[#FFF8F2] rounded-[24px] border border-[rgba(255,170,80,0.2)] p-8 space-y-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-lg shadow-[#FB8500]/25 animate-float-slow">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-base text-[#1A1A1A]">Preparing camera and live face tracker...</p>
              <p className="text-xs text-[#525252]">Processing face movement locally in your browser for instantaneous feedback.</p>
            </div>
          </div>
        )}

        {/* 3. Verifying/Analyzing Step-by-Step Animated Screen */}
        {livenessState === 'VERIFYING' && (
          <div className="flex flex-col items-center justify-center aspect-[4/3] bg-[#FFFDF8] rounded-[24px] border border-[rgba(255,170,80,0.2)] p-6 space-y-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-md shadow-[#FB8500]/20 animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-serif-display font-bold text-xl text-[#1A1A1A]">Analyzing liveness recording...</p>
              <p className="text-xs text-[#525252]">Verifying poses, frame continuity, and face quality.</p>
            </div>

            {/* Animated Step Progression Indicator */}
            <div className="w-full max-w-sm grid grid-cols-5 gap-1.5 text-[9px] font-bold text-center">
              <div className="space-y-1">
                <div className="h-2 bg-[#FB8500] rounded-full" />
                <span className="text-[#FB8500] block">Upload</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-[#FB8500] rounded-full" />
                <span className="text-[#FB8500] block">Detection</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-[#FFB703] rounded-full animate-pulse" />
                <span className="text-[#FB8500] block">Embedding</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-zinc-200 rounded-full" />
                <span className="text-[#8A8A8A] block">Searching</span>
              </div>
              <div className="space-y-1">
                <div className="h-2 bg-zinc-200 rounded-full" />
                <span className="text-[#8A8A8A] block">Found</span>
              </div>
            </div>

            <Progress value={65} className="w-3/4 h-2 bg-[#FFF8F2] [&>div]:bg-gradient-to-r [&>div]:from-[#FFB703] [&>div]:to-[#FB8500]" />
          </div>
        )}

        {/* 4. Verification Results Feedback */}
        {livenessState === 'FAILED' && detailedChecks && (
          <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.25)] p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#1A1A1A]">Overall Liveness Score:</span>
              <span className={`text-base font-bold ${verificationScore && verificationScore >= 50 ? 'text-emerald-600' : 'text-[#E63946]'}`}>
                {verificationScore?.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-[#525252]">
              <div className="flex items-center gap-2">
                {detailedChecks.face_consistency ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#E63946]" />}
                <span>Face Consistency</span>
              </div>
              <div className="flex items-center gap-2">
                {detailedChecks.pose_challenges ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#E63946]" />}
                <span>Pose Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                {detailedChecks.temporal_continuity ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#E63946]" />}
                <span>Temporal Continuity</span>
              </div>
              <div className="flex items-center gap-2">
                {detailedChecks.face_stability ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#E63946]" />}
                <span>Tracking Stability</span>
              </div>
              <div className="flex items-center gap-2">
                {detailedChecks.quality_metrics ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-[#E63946]" />}
                <span>Quality & Contrast</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Apple Photos Style Drag & Drop Zone (Used only if no selfie exists) */}
        {!selfieUrl && livenessState === 'IDLE' && !localPreview && !cameraActive && (
          <div 
            {...getRootProps()} 
            className="relative aspect-[4/3] rounded-[28px] overflow-hidden border-2 border-dashed border-[#FB8500]/30 hover:border-[#FB8500]/60 bg-gradient-to-b from-[#FFFDF8] to-[#FFF8F2] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 shadow-sm group"
          >
            <input {...getInputProps()} />
            
            {/* Floating Sparkles & Camera Icon Badge */}
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-lg shadow-[#FB8500]/25 group-hover:scale-105 transition-transform animate-float-slow">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-[#FFB703] absolute -top-2 -right-2 animate-bounce" />
            </div>

            <h3 className="font-serif-display font-bold text-xl text-[#1A1A1A]">Upload or Capture Selfie</h3>
            <p className="text-xs text-[#525252] mt-1 max-w-xs leading-relaxed">
              Drag & drop selfie photo or start live camera verification.
            </p>
            <span className="mt-3 text-[10px] font-bold text-[#FB8500] bg-white px-3 py-1 rounded-full border border-[rgba(255,170,80,0.2)] shadow-xs">
              Supports JPEG, PNG, WebP
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-4 border-t border-[rgba(255,170,80,0.15)] pt-6">
        <div className="flex gap-3">
          {/* Liveness Start Button */}
          {livenessState === 'IDLE' && !selfieUrl && (
            <button onClick={startLivenessFlow} className="btn-primary-luxury !h-12 !px-6 !text-xs flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Verify Liveness
            </button>
          )}
          
          {/* Retry Button */}
          {livenessState === 'FAILED' && (
            <button onClick={startLivenessFlow} className="btn-secondary-luxury !h-12 !px-6 !text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Verification
            </button>
          )}
        </div>

        <div className="flex gap-3 ml-auto">
          {/* Delete Stored Selfie */}
          {selfieUrl && livenessState === 'IDLE' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 h-12 rounded-full bg-red-50 text-[#E63946] border border-red-200 hover:bg-red-100 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selfie
            </button>
          )}

          {/* Replace Option */}
          {selfieUrl && livenessState === 'IDLE' && (
            <button onClick={startLivenessFlow} className="btn-secondary-luxury !h-12 !px-6 !text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Verify New Selfie
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

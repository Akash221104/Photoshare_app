// components/selfie/selfie-upload.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Trash2, RefreshCw, Loader2, Video, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SelfieUploadProps {
  selfieUrl: string | null;
  uploading: boolean;
  deleting: boolean;
  onUpload: (base64Image: string) => Promise<any>;
  onDelete: () => Promise<any>;
}

export function SelfieUpload({
  selfieUrl,
  uploading,
  deleting,
  onUpload,
  onDelete,
}: SelfieUploadProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle Drag & Drop / File Select
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': [],
      'image/webp': [],
    },
    multiple: false,
  });

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    setCameraError(null);
    setLocalPreview(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam access is not supported by this browser or requires a secure connection (HTTPS).');
      return;
    }

    try {
      // Use standard user facingMode without rigid constraints to prevent OverconstrainedError on mobile
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('[Selfie Camera] User facingMode failed, attempting fallback default camera:', err.message);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setCameraActive(true);
      } catch (fallbackErr: any) {
        console.error('[Selfie Camera] Fallback camera failed:', fallbackErr);
        setCameraError('Could not access webcam. Please verify site camera permissions or select a local photo file instead.');
      }
    }
  };

  // Stop Camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Capture Photo
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg');
        setLocalPreview(base64Data);
      }
      stopCamera();
    }
  };

  // Confirm Upload
  const handleUploadSubmit = async () => {
    if (!localPreview) return;
    setErrorMsg(null);
    setUploadProgress(15);
    try {
      setUploadProgress(40);
      await onUpload(localPreview);
      setUploadProgress(100);
      setLocalPreview(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze and save selfie.');
      setUploadProgress(0);
    }
  };

  // Clear Local State
  const clearSelection = () => {
    setLocalPreview(null);
    setErrorMsg(null);
    setUploadProgress(0);
    stopCamera();
  };

  // Handle Delete Stored Selfie
  const handleDelete = async () => {
    setErrorMsg(null);
    try {
      await onDelete();
      clearSelection();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove selfie.');
    }
  };

  return (
    <Card className="border border-muted/50 bg-card/65 backdrop-blur-md shadow-xl max-w-lg mx-auto w-full transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          <span>Selfie Management</span>
        </CardTitle>
        <CardDescription>
          Upload exactly one selfie to instantly locate yourself in this event's photos.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Alert Display */}
        {errorMsg && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Failed</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {cameraError && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hardware Error</AlertTitle>
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {/* Upload States Area */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-muted bg-muted/40 flex flex-col items-center justify-center transition-all duration-300">
          
          {/* 1. Stored Selfie State */}
          {selfieUrl && !localPreview && !cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img
                src={selfieUrl}
                alt="Active Selfie"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45 flex flex-col justify-end p-4">
                <span className="text-white text-xs font-semibold uppercase tracking-wider mb-2 self-start bg-emerald-600/90 px-2 py-0.5 rounded">
                  Active Selfie Stored
                </span>
              </div>
            </div>
          )}

          {/* 2. Camera Active State */}
          {cameraActive && (
            <div className="absolute inset-0 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <Button size="sm" onClick={capturePhoto} className="bg-primary hover:bg-primary/95 text-white">
                  Capture Frame
                </Button>
                <Button size="sm" variant="secondary" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* 3. Local Selected Preview State */}
          {localPreview && !cameraActive && (
            <div className="absolute inset-0">
              <img
                src={localPreview}
                alt="Captured/Selected Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="icon" variant="destructive" onClick={clearSelection} className="h-8 w-8">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 4. Dropzone/Idle State */}
          {!selfieUrl && !localPreview && !cameraActive && (
            <div
              {...getRootProps()}
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all ${
                isDragActive ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-muted-foreground mb-3 animate-bounce" />
              <p className="font-semibold text-sm">Drag & drop selfie here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPEG, PNG, or WebP up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Extracting face embedding vector...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5 bg-muted" />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-3 border-t border-muted/30 pt-4">
        <div className="flex gap-2">
          {/* Camera Button */}
          {!cameraActive && !selfieUrl && !localPreview && (
            <Button variant="outline" size="sm" onClick={startCamera} className="gap-1 text-xs">
              <Camera className="w-3.5 h-3.5" />
              Use Webcam
            </Button>
          )}

          {/* File Browse Fallback */}
          {!selfieUrl && !localPreview && !cameraActive && (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Upload className="w-3.5 h-3.5" />
                Browse File
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-auto">
          {/* Delete Selfie Option */}
          {selfieUrl && !localPreview && !cameraActive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1 text-xs bg-red-600/90 hover:bg-red-600 text-white"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Selfie
            </Button>
          )}

          {/* Replace Selfie Option */}
          {selfieUrl && !localPreview && !cameraActive && (
            <Button variant="secondary" size="sm" onClick={startCamera} className="gap-1 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </Button>
          )}

          {/* Upload Action */}
          {localPreview && (
            <Button
              size="sm"
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="gap-1 text-xs bg-primary text-white hover:bg-primary/95"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Process & Match
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

// components/download/download-center.tsx
'use client';

import React, { useState } from 'react';
import { Download, Loader2, Sparkles, Upload, CheckSquare, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

interface DownloadCenterProps {
  eventId: string;
  selectedPhotoIds: string[];
  clearSelection: () => void;
  threshold: number;
}

export function DownloadCenter({
  eventId,
  selectedPhotoIds,
  clearSelection,
  threshold,
}: DownloadCenterProps) {
  const [downloading, setDownloading] = useState<'selected' | 'uploads' | 'matches' | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Abort Controller for cancelling download requests
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const simulateProgress = (controller: AbortController) => {
    setProgress(5);
    const interval = setInterval(() => {
      if (controller.signal.aborted) {
        clearInterval(interval);
        return;
      }
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);
    return interval;
  };

  const handleDownload = async (type: 'selected' | 'uploads' | 'matches') => {
    setErrorMsg(null);
    setDownloading(type);
    setProgress(0);

    const controller = new AbortController();
    setAbortController(controller);

    const progressInterval = simulateProgress(controller);

    try {
      let endpoint = '';
      let body: any = { eventId };

      if (type === 'selected') {
        endpoint = '/api/download/selected';
        body.photoIds = selectedPhotoIds;
        body.threshold = threshold;
      } else if (type === 'uploads') {
        endpoint = '/api/download/uploaded';
      } else if (type === 'matches') {
        endpoint = '/api/download/matched';
        body.threshold = threshold;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to download ZIP archive');
      }

      setProgress(95);

      // Convert response stream to blob
      const blob = await response.blob();
      if (controller.signal.aborted) return;

      setProgress(100);

      // Trigger browser download dialog
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `event-${eventId}-${type}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('ZIP archive downloaded successfully.');
      if (type === 'selected') {
        clearSelection();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info('Download cancelled.');
      } else {
        console.error('Download failed:', err);
        setErrorMsg(err.message || 'Server failed to build ZIP archive.');
        toast.error('Download failed: ' + err.message);
      }
    } finally {
      clearInterval(progressInterval);
      setDownloading(null);
      setAbortController(null);
      setProgress(0);
    }
  };

  const cancelDownload = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const selectedCount = selectedPhotoIds.length;

  return (
    <div className="bg-card/40 border border-muted/50 rounded-lg p-5 backdrop-blur-md space-y-4 shadow-md transition-all duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Download Album Center</h4>
            <p className="text-xs text-muted-foreground">
              Create instant ZIP archives of your uploads or matching AI face detections.
            </p>
          </div>
        </div>

        {/* Selection Status Badge */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{selectedCount} Selected</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-xs py-2.5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs font-bold">Download Failed</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-3 pt-1">
        {/* Download Selected */}
        <Button
          size="sm"
          variant="default"
          onClick={() => handleDownload('selected')}
          disabled={selectedCount === 0 || downloading !== null}
          className="text-xs gap-1.5 shadow"
        >
          {downloading === 'selected' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckSquare className="w-3.5 h-3.5" />
          )}
          Download Selected ({selectedCount})
        </Button>

        {/* Download All My Uploads */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload('uploads')}
          disabled={downloading !== null}
          className="text-xs gap-1.5 border-muted/50 hover:bg-muted/10"
        >
          {downloading === 'uploads' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
          )}
          Download All My Uploads
        </Button>

        {/* Download All My AI Photos */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload('matches')}
          disabled={downloading !== null}
          className="text-xs gap-1.5 border-muted/50 hover:bg-muted/10"
        >
          {downloading === 'matches' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          )}
          Download My AI Matches
        </Button>

        {/* Cancel button during active download */}
        {downloading !== null && (
          <Button
            size="sm"
            variant="destructive"
            onClick={cancelDownload}
            className="text-xs gap-1 ml-auto bg-red-600/90 hover:bg-red-600 text-white"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </Button>
        )}
      </div>

      {/* Progress Indicator */}
      {downloading !== null && (
        <div className="space-y-1.5 pt-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
            <span>Compiling photo ZIP archive...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>
      )}
    </div>
  );
}

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
    <div className="w-full transition-all duration-300">
      {/* Error Alert */}
      {errorMsg && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-[#E63946] rounded-2xl mb-4 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="font-semibold">{errorMsg}</AlertDescription>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-bold underline">Dismiss</button>
        </Alert>
      )}

      {/* Downloading Progress Indicator Bar */}
      {downloading && (
        <div className="bg-[#FFF8F2] border-2 border-[#FB8500] p-4 rounded-2xl space-y-2.5 shadow-lg animate-in fade-in duration-300 mb-4">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#FB8500] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Building ZIP Archive ({downloading === 'selected' ? `${selectedCount} selected photos` : downloading === 'uploads' ? 'all your uploads' : 'all AI matched photos'})...
            </span>
            <span className="text-[#1A1A1A] font-mono">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-[#FFB703] [&>div]:to-[#FB8500]" />
          <div className="flex justify-end">
            <button onClick={cancelDownload} className="text-[11px] font-bold text-rose-500 hover:underline">
              Cancel Download
            </button>
          </div>
        </div>
      )}

      {/* Floating Active Selection Bar (Shown when items are selected) */}
      {selectedCount > 0 ? (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-[#FB8500] p-3 sm:p-4 rounded-2xl shadow-xl shadow-[#FB8500]/10 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#FB8500] bg-[#FFF8F2] px-3.5 py-1.5 rounded-full border border-[rgba(255,170,80,0.3)]">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedCount} {selectedCount === 1 ? 'Photo' : 'Photos'} Selected</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleDownload('selected')}
              disabled={downloading !== null}
              className="btn-primary-luxury !h-10 !px-5 !text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Selected ({selectedCount}) ZIP</span>
            </button>
            <button
              onClick={clearSelection}
              className="px-3.5 h-10 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-bold text-xs transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        /* Compact Default Download Controls Pill */
        <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.22)] p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-sm">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-[#1A1A1A]">Download Album Center:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleDownload('uploads')}
              disabled={downloading !== null}
              className="btn-secondary-luxury !h-9 !px-4 !text-[11px] flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#FB8500]" />
              <span>Download All My Uploads</span>
            </button>

            <button
              onClick={() => handleDownload('matches')}
              disabled={downloading !== null}
              className="btn-secondary-luxury !h-9 !px-4 !text-[11px] flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download My AI Matches</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// components/upload/floating-upload-tray.tsx
// A floating status tray in the bottom-right corner to manage background uploads.
// Reads from UploadContext and displays speed, ETA, detailed active/waiting queues, and Dismiss controls.

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUploadContext } from '@/context/UploadContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronUp,
  ChevronDown,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export function FloatingUploadTray() {
  const {
    tasks,
    isUploading,
    cancelUpload,
    retryTask,
    retryFailed,
    clearCompleted,
    clearQueue,
    completedCount,
    failedCount,
    activeCount,
    pendingCount,
    uploadProgress,
    speed,
    eta,
  } = useUploadContext();

  const [minimized, setMinimized] = useState(false);
  const prevTasksLength = useRef(0);

  // Auto-expand the tray when new uploads are added to the queue
  useEffect(() => {
    if (tasks.length > prevTasksLength.current && prevTasksLength.current === 0) {
      setMinimized(false);
    }
    prevTasksLength.current = tasks.length;
  }, [tasks.length]);

  if (tasks.length === 0) return null;

  const allDone = activeCount === 0 && pendingCount === 0;

  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec <= 0) return '';
    if (bytesPerSec >= 1024 * 1024) {
      return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    }
    return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  };

  const formatETA = (seconds: number) => {
    if (seconds <= 0) return 'Calculating...';
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
    return `${seconds}s remaining`;
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-32px)] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 pr-2 min-w-0">
          <Upload className={`h-4.5 w-4.5 text-violet-500 shrink-0 ${isUploading ? 'animate-bounce' : ''}`} />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">
            {isUploading
              ? `Uploading Photos (${completedCount}/${tasks.length})`
              : allDone
              ? `Upload Complete - ${completedCount} Photos Uploaded - AI Processing...`
              : 'Upload queue'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            onClick={() => setMinimized(!minimized)}
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            onClick={clearQueue}
            title="Clear all"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress & Speed/ETA Section */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="flex justify-between items-center text-[11px] text-zinc-500 mb-1.5 font-semibold">
          <div className="flex flex-col">
            <span>{uploadProgress}% completed</span>
            {isUploading && (
              <span className="text-[10px] text-zinc-400 font-medium">
                {formatSpeed(speed)} {speed > 0 && '•'} {formatETA(eta)}
              </span>
            )}
            {isUploading && (
              <span className="text-[9px] text-violet-500 dark:text-violet-400 font-bold mt-0.5">
                {activeCount} Active • {pendingCount} Waiting
              </span>
            )}
          </div>
          <span className="flex gap-2 shrink-0">
            {completedCount > 0 && <span className="text-green-600 dark:text-green-400">{completedCount} success</span>}
            {failedCount > 0 && <span className="text-red-600 dark:text-red-400">{failedCount} failed</span>}
          </span>
        </div>
        <Progress value={uploadProgress} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      {/* Task List (collapsible) */}
      {!minimized && (
        <ScrollArea className="flex-1 max-h-72 p-3 bg-white dark:bg-zinc-950">
          <div className="space-y-2 pr-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/40 dark:bg-zinc-900/5 hover:bg-zinc-50 dark:hover:bg-zinc-900/10 transition-colors gap-3"
              >
                {/* File Thumbnail & Details */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-9 w-9 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-800/50 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.previewUrl}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {task.fileName}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium">
                      {task.status === 'uploading' && `Uploading... ${task.progress}%`}
                      {task.status === 'registering' && 'Registering...'}
                      {task.status === 'completed' && 'Completed'}
                      {task.status === 'cancelled' && 'Cancelled'}
                      {task.status === 'failed' && (
                        <span className="text-red-500 font-semibold" title={task.error}>
                          {task.error || 'Upload failed'}
                        </span>
                      )}
                      {task.status === 'waiting' && 'Waiting...'}
                      {task.retryCount > 0 && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <span className="text-violet-500 ml-1">
                          (Retry {task.retryCount}/3)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {task.status === 'uploading' && (
                    <span className="text-[9px] font-bold text-violet-500 dark:text-violet-400 select-none">
                      {task.progress}%
                    </span>
                  )}

                  {task.status === 'completed' && (
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-500 shrink-0" />
                  )}

                  {task.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-500 hover:text-violet-500 dark:text-zinc-400 dark:hover:text-violet-400"
                      onClick={() => retryTask(task.id)}
                      title="Retry this file"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Cancel / Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                    onClick={() => cancelUpload(task.id)}
                    title={task.status === 'uploading' || task.status === 'waiting' || task.status === 'registering' ? 'Cancel upload' : 'Remove'}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer controls */}
      {!minimized && (failedCount > 0 || allDone) && (
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2 bg-zinc-50/20 dark:bg-zinc-900/5">
          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              onClick={retryFailed}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-zinc-500 animate-spin-hover" />
              Retry Failed
            </Button>
          )}
          {allDone && (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-8 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              onClick={clearCompleted}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// components/upload/photo-uploader.tsx
// Drag-and-drop batch photo uploader dialog.

'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload } from '@/hooks/useUpload';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/schemas/upload.schema';

interface PhotoUploaderProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export function PhotoUploader({ eventId, open, onOpenChange, onUploadComplete }: PhotoUploaderProps) {
  const {
    tasks,
    uploading,
    addFiles,
    removeTask,
    clearQueue,
    startUpload,
    retryTask,
  } = useUpload(eventId, onUploadComplete);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
  });

  const handleClose = () => {
    if (uploading) {
      if (!window.confirm('Upload is in progress. Closing this dialog will not cancel ongoing network requests. Are you sure?')) {
        return;
      }
    }
    clearQueue();
    onOpenChange(false);
  };

  const idleTasksCount = tasks.filter((t) => t.status === 'idle').length;
  const isQueueEmpty = tasks.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Photos
          </DialogTitle>
          <DialogDescription>
            Drag and drop images here. Max file size is 10MB.
          </DialogDescription>
        </DialogHeader>

        {/* Drag and Drop Zone */}
        <div
          {...getRootProps()}
          className={`flex-1 min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mt-2 shrink-0 ${
            isDragActive
              ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900/55'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/20'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-zinc-400 mb-2 animate-bounce" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {isDragActive ? 'Drop files here...' : 'Drag & drop photos, or click to browse'}
          </p>
          <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            Supports JPG, JPEG, PNG, and WEBP.
          </p>
        </div>

        {/* Upload Task List */}
        {!isQueueEmpty && (
          <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1 max-h-[220px]">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/10 text-sm gap-4"
              >
                {/* Image Preview */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={task.previewUrl}
                      alt={task.file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-50 truncate max-w-[180px]">
                      {task.file.name}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {(task.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {task.status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="w-16 h-1.5" />
                      <span className="text-[10px] font-medium text-zinc-500">{task.progress}%</span>
                    </div>
                  )}
                  {task.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {task.status === 'failed' && (
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-transparent"
                        onClick={() => retryTask(task.id)}
                      >
                        <RefreshCw className="h-3 w-3 text-zinc-500" />
                      </Button>
                    </div>
                  )}
                  {task.status === 'idle' && !uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="h-4 w-4 text-zinc-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="shrink-0 pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-row items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={uploading}
            className="text-xs text-zinc-500"
          >
            Close
          </Button>

          {!isQueueEmpty && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearQueue}
                disabled={uploading}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={startUpload}
                disabled={uploading || idleTasksCount === 0}
              >
                {uploading ? 'Uploading...' : `Upload ${idleTasksCount} Files`}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

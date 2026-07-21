// components/upload/inline-event-uploader.tsx
// Ultra-modern 2026 inline drag-and-drop batch event photo uploader card.

'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Sparkles, CheckCircle2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { MAX_FILE_SIZE } from '@/schemas/upload.schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface InlineEventUploaderProps {
  eventId: string;
  onUploadComplete?: () => void;
}

export function InlineEventUploader({ eventId, onUploadComplete }: InlineEventUploaderProps) {
  const {
    tasks,
    uploading,
    addFiles,
    clearQueue,
    startUpload,
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

  const waitingTasksCount = tasks.filter((t) => t.status === 'waiting').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = tasks.length;

  return (
    <Card className="card-luxury max-w-xl mx-auto w-full transition-all duration-300 p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-serif-display flex items-center gap-3 text-[#1A1A1A]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-md shadow-[#FB8500]/20">
            <Upload className="w-5 h-5" />
          </div>
          <span>Upload Event Photos</span>
        </CardTitle>
        <CardDescription className="text-sm text-[#525252]">
          Drag & drop event photos here to index them into this event gallery.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dropzone Container */}
        <div
          {...getRootProps()}
          className={`relative aspect-[4/3] rounded-[28px] overflow-hidden border-2 border-dashed border-[#FB8500]/30 hover:border-[#FB8500]/70 bg-gradient-to-b from-[#FFFDF8] to-[#FFF8F2] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 shadow-sm group ${
            isDragActive ? 'border-[#FB8500] bg-[#FFF4E8]' : ''
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />

          <div className="relative mb-3">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-lg shadow-[#FB8500]/25 group-hover:scale-105 transition-transform animate-float-slow text-white">
              {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <Sparkles className="w-5 h-5 text-[#FFB703] absolute -top-2 -right-2 animate-bounce" />
          </div>

          <h3 className="font-serif-display font-bold text-xl text-[#1A1A1A]">
            {isDragActive ? 'Drop photos here now...' : 'Drag & Drop Event Photos'}
          </h3>
          <p className="text-xs text-[#525252] mt-1 max-w-xs leading-relaxed">
            Upload batch event photos. Photos are instantly indexed for guest facial matching.
          </p>

          <span className="mt-3 text-[10px] font-bold text-[#FB8500] bg-white px-3 py-1 rounded-full border border-[rgba(255,170,80,0.25)] shadow-xs">
            Max 10MB per image • JPEG, PNG, WebP
          </span>
        </div>

        {/* Upload Action Bar */}
        {totalTasksCount > 0 && (
          <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.22)] p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-[#1A1A1A]">
              <span>Queue: {totalTasksCount} photos ({completedTasksCount} completed)</span>
              {uploading && (
                <span className="text-[#FB8500] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!uploading && waitingTasksCount > 0 && (
                <button
                  onClick={startUpload}
                  className="btn-primary-luxury !h-10 !px-5 !text-xs flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Start Uploading ({waitingTasksCount} queued)</span>
                </button>
              )}
              {!uploading && (
                <button
                  onClick={clearQueue}
                  className="px-4 h-10 rounded-full bg-zinc-200 text-zinc-700 hover:bg-zinc-300 font-bold text-xs transition-colors"
                >
                  Clear Queue
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

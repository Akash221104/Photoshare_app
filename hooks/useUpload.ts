// hooks/useUpload.ts
// Backwards-compatible hook wrapper that connects to the global UploadContext.
// Ensures components using useUpload function exactly as before, but with global queue support.

'use client';

import React, { useEffect, useRef } from 'react';
import { useUploadContext, UploadTask } from '@/context/UploadContext';

export function useUpload(eventId: string, onUploadSuccess?: () => void) {
  const {
    tasks: globalTasks,
    isUploading,
    addFiles: globalAddFiles,
    startUpload: globalStartUpload,
    cancelUpload,
    retryTask: globalRetryTask,
    clearQueue,
  } = useUploadContext();

  // 1. Filter global tasks to return only tasks belonging to this event
  const tasks = globalTasks.filter((t) => t.eventId === eventId);

  // 2. Safely trigger onUploadSuccess callback when completed count for this event increases
  const eventCompletedCount = globalTasks.filter(
    (t) => t.eventId === eventId && t.status === 'completed'
  ).length;
  const prevCompletedCountRef = useRef(eventCompletedCount);

  useEffect(() => {
    if (eventCompletedCount > prevCompletedCountRef.current) {
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }
    prevCompletedCountRef.current = eventCompletedCount;
  }, [eventCompletedCount, onUploadSuccess]);

  const addFiles = (files: File[]) => {
    globalAddFiles(files, eventId);
  };

  const removeTask = (taskId: string) => {
    cancelUpload(taskId);
  };

  const startUpload = async () => {
    await globalStartUpload();
  };

  const retryTask = async (taskId: string) => {
    await globalRetryTask(taskId);
  };

  return {
    tasks,
    uploading: isUploading,
    addFiles,
    removeTask,
    clearQueue,
    startUpload,
    retryTask,
  };
}

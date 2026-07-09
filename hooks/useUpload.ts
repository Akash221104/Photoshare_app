// hooks/useUpload.ts
// Client hook to manage bulk image uploads, track upload progress, and handle retries.

import React from 'react';
import { toast } from 'sonner';

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'failed';
  error?: string;
  previewUrl: string;
}

export function useUpload(eventId: string, onUploadSuccess?: () => void) {
  const [tasks, setTasks] = React.useState<UploadTask[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const addFiles = (files: File[]) => {
    const newTasks = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'idle' as const,
      previewUrl: URL.createObjectURL(file),
    }));
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (task) {
        URL.revokeObjectURL(task.previewUrl);
      }
      return prev.filter((t) => t.id !== taskId);
    });
  };

  const clearQueue = () => {
    tasks.forEach((t) => URL.revokeObjectURL(t.previewUrl));
    setTasks([]);
    setUploading(false);
  };

  const uploadTask = async (task: UploadTask): Promise<boolean> => {
    // Update status to uploading
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'uploading', progress: 10 } : t))
    );

    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('eventId', eventId);

    try {
      // Direct XHR to support progress reporting, or fetch API. 
      // Since fetch does not natively support upload progress without custom stream wrappers,
      // using standard XMLHttpRequest is the robust industry standard!
      return await new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/photos/upload');

        // Progress listener
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, progress: Math.max(10, percentComplete - 5) } : t))
            );
          }
        });

        // Response handlers
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, status: 'success', progress: 100 } : t))
            );
            resolve(true);
          } else {
            let errMsg = 'Upload failed';
            try {
              const body = JSON.parse(xhr.responseText);
              errMsg = body.error || errMsg;
            } catch (e) {}
            reject(new Error(errMsg));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network connection error')));
        xhr.send(formData);
      });
    } catch (err: any) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: 'failed', error: err.message } : t))
      );
      return false;
    }
  };

  const startUpload = async () => {
    const idleTasks = tasks.filter((t) => t.status === 'idle' || t.status === 'failed');
    if (idleTasks.length === 0) return;

    setUploading(true);
    let successCount = 0;

    // Process uploads sequentially or concurrently. Concurrency level of 2 is optimal.
    for (const task of idleTasks) {
      const ok = await uploadTask(task);
      if (ok) successCount++;
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} photos!`);
      if (onUploadSuccess) onUploadSuccess();
    }
  };

  const retryTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await uploadTask(task);
    if (onUploadSuccess) onUploadSuccess();
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      tasks.forEach((t) => URL.revokeObjectURL(t.previewUrl));
    };
  }, [tasks]);

  return {
    tasks,
    uploading,
    addFiles,
    removeTask,
    clearQueue,
    startUpload,
    retryTask,
  };
}

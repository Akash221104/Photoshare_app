// context/UploadContext.tsx
// Global React Context to manage a concurrent, throttled upload queue of photos directly to Cloudinary.
// Features batch grouping, automatic retries (up to 3 attempts), cancelled statuses, speed & ETA tracking, and memory optimizations.

'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/schemas/upload.schema';
import { useNotification } from '@/hooks/useNotification';

export interface UploadTask {
  id: string;
  batchId: string;
  file: File | null; // Nullified after successful upload to free memory
  fileName: string;
  fileSize: number;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  status: 'waiting' | 'uploading' | 'registering' | 'completed' | 'failed' | 'cancelled';
  cloudinaryUrl?: string;
  photoId?: string; // Database ID returned from registration
  aiStatus?: 'pending' | 'completed' | 'failed'; // AI processing status
  error?: string;
  previewUrl: string;
  eventId: string;
  retryCount: number;
}

interface UploadContextType {
  tasks: UploadTask[];
  isUploading: boolean;
  addFiles: (files: File[], eventId: string) => void;
  startUpload: () => Promise<void>;
  cancelUpload: (taskId: string) => void;
  cancelBatch: (batchId: string) => void;
  retryFailed: () => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  clearCompleted: () => void;
  clearQueue: () => void;
  completedCount: number;
  failedCount: number;
  activeCount: number;
  pendingCount: number;
  uploadProgress: number;
  speed: number; // bytes/sec
  eta: number; // seconds remaining
  aiProcessing: boolean; // Whether the background AI queue is processing our uploads
  completedAiCount: number; // Count of completed AI processes in current queue
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { addNotification, updateNotification } = useNotification();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [aiProcessing, setAiProcessing] = useState(false);

  const tasksRef = useRef<UploadTask[]>([]);
  const xhrRef = useRef<Record<string, XMLHttpRequest>>({});
  const startTimeRef = useRef<number | null>(null);

  // Sync ref with state to prevent stale closures in async workers
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Speed and ETA calculations effect
  useEffect(() => {
    const activeTasks = tasks.filter((t) => t.status === 'uploading' || t.status === 'registering');
    
    if (activeTasks.length === 0) {
      setSpeed(0);
      setEta(0);
      startTimeRef.current = null;
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      if (elapsedSeconds < 0.5) return;

      // Sum bytes uploaded across active tasks
      const totalUploadedBytes = tasks.reduce((sum, t) => {
        if (t.status === 'completed') return sum + t.fileSize;
        if (t.status === 'failed' || t.status === 'cancelled') return sum;
        return sum + t.uploadedBytes;
      }, 0);

      // Current average speed: total bytes uploaded since start / elapsed time
      const currentSpeed = totalUploadedBytes / elapsedSeconds;
      setSpeed(currentSpeed);

      // Remaining bytes of active + pending tasks
      const remainingBytes = tasks.reduce((sum, t) => {
        if (t.status === 'waiting' || t.status === 'uploading' || t.status === 'registering') {
          return sum + (t.fileSize - t.uploadedBytes);
        }
        return sum;
      }, 0);

      const estimatedTime = currentSpeed > 1024 ? Math.round(remainingBytes / currentSpeed) : 0;
      setEta(estimatedTime);

      // Dynamically update the upload notification
      const activeBatchId = activeTasks[0]?.batchId;
      if (activeBatchId) {
        const batchTasks = tasksRef.current.filter((t) => t.batchId === activeBatchId);
        const totalInBatch = batchTasks.length;
        const completedInBatch = batchTasks.filter((t) => t.status === 'completed').length;
        const batchProgress = totalInBatch > 0 
          ? Math.round(batchTasks.reduce((sum, t) => sum + t.progress, 0) / totalInBatch)
          : 0;

        const speedText = currentSpeed >= 1024 * 1024 
          ? `${(currentSpeed / (1024 * 1024)).toFixed(1)} MB/s` 
          : `${(currentSpeed / 1024).toFixed(0)} KB/s`;

        const etaText = estimatedTime >= 60 
          ? `${Math.floor(estimatedTime / 60)}m ${estimatedTime % 60}s remaining` 
          : `${estimatedTime}s remaining`;

        updateNotification(activeBatchId, {
          progress: batchProgress,
          description: `${completedInBatch} of ${totalInBatch} photos uploaded (${speedText} • ${etaText}).`
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, isUploading]);

  // AI Queue Status Polling Effect
  useEffect(() => {
    // Check if there are tasks currently completed in upload but pending AI processing
    const pendingAiTasks = tasks.filter((t) => t.status === 'completed' && t.aiStatus === 'pending');
    
    if (pendingAiTasks.length === 0) {
      setAiProcessing(false);
      return;
    }

    setAiProcessing(true);

    const interval = setInterval(async () => {
      let changed = false;
      const updatedTasks = [...tasksRef.current];

      for (let i = 0; i < updatedTasks.length; i++) {
        const task = updatedTasks[i];
        if (task.status === 'completed' && task.aiStatus === 'pending' && task.photoId) {
          try {
            const res = await fetch(`/api/photos/${task.photoId}`);
            if (res.ok) {
              const data = await res.json();
              const newStatus = data.processing_status;
              if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
                updatedTasks[i] = {
                  ...task,
                  aiStatus: newStatus === 'COMPLETED' ? 'completed' : 'failed',
                };
                changed = true;
              }
            }
          } catch (err) {
            console.error(`Failed to poll AI status for photo ${task.photoId}:`, err);
          }
        }
      }

      if (changed) {
        setTasks(updatedTasks);

        const activeBatchId = pendingAiTasks[0]?.batchId;
        if (activeBatchId) {
          const batchTasks = updatedTasks.filter((t) => t.batchId === activeBatchId && t.status === 'completed');
          const totalInBatch = batchTasks.length;
          const completedAi = batchTasks.filter((t) => t.aiStatus !== 'pending').length;
          const failedAi = batchTasks.filter((t) => t.aiStatus === 'failed').length;
          
          const progressVal = totalInBatch > 0 ? Math.round((completedAi / totalInBatch) * 100) : 100;

          // Check if all pending AI tasks in the current batch have finished processing
          const stillPending = updatedTasks.some((t) => t.status === 'completed' && t.aiStatus === 'pending');
          if (!stillPending) {
            if (failedAi > 0) {
              updateNotification(`ai-${activeBatchId}`, {
                title: '⚠ AI Processing Completed',
                description: `${totalInBatch - failedAi} photos processed. ${failedAi} photos failed.`,
                category: 'warning',
                priority: 'high',
                progress: 100,
              });
              toast.warning(`AI Processing complete with ${failedAi} failed items.`);
            } else {
              updateNotification(`ai-${activeBatchId}`, {
                title: '🎉 Event Ready',
                description: 'All uploaded photos have been processed. Guests can now search their photos instantly.',
                category: 'event',
                priority: 'critical',
                progress: 100,
                action: {
                  label: 'Open Gallery',
                  href: `/events/${pendingAiTasks[0]?.eventId}`,
                  actionType: 'link'
                }
              });
              toast.success('AI processing completed! Your personal gallery is ready.');
            }
            window.dispatchEvent(new Event('gallery-update'));
          } else {
            updateNotification(`ai-${activeBatchId}`, {
              title: '🤖 AI Processing...',
              description: `Analyzing photos: ${completedAi} / ${totalInBatch} completed.`,
              progress: progressVal,
            });
          }
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [tasks, isUploading]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      tasksRef.current.forEach((t) => {
        if (t.previewUrl) {
          URL.revokeObjectURL(t.previewUrl);
        }
      });
    };
  }, []);

  const addFiles = (files: File[], eventId: string) => {
    const validTasks: UploadTask[] = [];
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 10MB file size limit.`);
        return;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" has an unsupported format. Only JPEG, PNG, and WebP are allowed.`);
        return;
      }

      validTasks.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        batchId,
        file,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size,
        status: 'waiting',
        previewUrl: URL.createObjectURL(file),
        eventId,
        retryCount: 0,
      });
    });

    if (validTasks.length > 0) {
      setTasks((prev) => [...prev, ...validTasks]);
      toast.success(`Added ${validTasks.length} photos to the upload queue.`);
    }
  };

  const uploadTask = async (taskId: string) => {
    const MAX_RETRIES = 3;
    let attempt = 0;
    let success = false;
    let errorMsg = '';
    let cloudinaryData: any = null;

    // Outer retry loop for the entire upload + register sequence
    while (attempt < MAX_RETRIES && !success) {
      // Guard: Check if user cancelled in between retries
      const checkTask = tasksRef.current.find((t) => t.id === taskId);
      if (!checkTask || checkTask.status === 'cancelled') {
        return;
      }

      attempt++;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, retryCount: attempt - 1 } : t))
      );

      try {
        // Reset uploadedBytes/progress state for this retry attempt
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'uploading',
                  progress: 0,
                  uploadedBytes: 0,
                  error: undefined,
                }
              : t
          )
        );

        const currentTask = tasksRef.current.find((t) => t.id === taskId);
        if (!currentTask || !currentTask.file) {
          throw new Error('File reference missing');
        }

        // Attempt Step A: Fetch signature credentials
        const sigRes = await fetch('/api/photos/upload/signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: currentTask.eventId,
            fileType: currentTask.file.type,
            fileSize: currentTask.file.size,
          }),
        });

        if (!sigRes.ok) {
          const errData = await sigRes.json();
          throw new Error(errData.error || 'Failed to obtain signature');
        }

        const { apiKey, cloudName, timestamp, signature, folder } = await sigRes.json();

        // Attempt Step B: Direct XHR Upload to Cloudinary
        cloudinaryData = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current[taskId] = xhr;

          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        progress: percent,
                        uploadedBytes: event.loaded,
                        totalBytes: event.total,
                      }
                    : t
                )
              );
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(new Error('Invalid response received from Cloudinary'));
              }
            } else {
              let msg = 'Cloudinary upload failed';
              try {
                const res = JSON.parse(xhr.responseText);
                msg = res.error?.message || msg;
              } catch (e) {}
              reject(new Error(msg));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network connection error during Cloudinary upload'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          const formData = new FormData();
          formData.append('file', currentTask.file!);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp.toString());
          formData.append('signature', signature);
          formData.append('folder', folder);

          xhr.send(formData);
        });

        // Set status to registering
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'registering', progress: 100 } : t))
        );

        // Attempt Step C: Register photo metadata
        const regRes = await fetch('/api/photos/upload/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: currentTask.eventId,
            secure_url: cloudinaryData.secure_url,
            public_id: cloudinaryData.public_id,
            width: cloudinaryData.width,
            height: cloudinaryData.height,
            bytes: cloudinaryData.bytes,
            format: cloudinaryData.format,
          }),
        });

        if (!regRes.ok) {
          const errData = await regRes.json();
          throw new Error(errData.error || 'Failed to register photo metadata');
        }

        const registeredPhoto = await regRes.json();
        
        // Success: Clean up preview URL
        URL.revokeObjectURL(currentTask.previewUrl);

        // Finalize state
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed',
                  progress: 100,
                  uploadedBytes: t.fileSize,
                  cloudinaryUrl: registeredPhoto.cloudinary_url,
                  photoId: registeredPhoto.id,
                  aiStatus: 'pending',
                  file: null, // Purge from RAM
                }
              : t
          )
        );

        success = true;
      } catch (err: any) {
        errorMsg = err.message || 'Upload failed';

        // If the upload was cancelled, break immediately and don't retry!
        if (errorMsg === 'Upload cancelled') {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: 'cancelled', error: 'Upload cancelled' } : t))
          );
          return;
        }

        console.warn(`[Upload Context] Task ${taskId} attempt ${attempt} failed: ${errorMsg}`);

        // Simple backoff wait before retry
        if (attempt < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      } finally {
        delete xhrRef.current[taskId];
      }
    }

    if (!success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === 'cancelled' ? 'cancelled' : 'failed',
                error: errorMsg || 'Upload failed after 3 attempts',
              }
            : t
        )
      );
    }
  };

  const startUpload = async () => {
    const pendingTasks = tasksRef.current.filter((t) => t.status === 'waiting' || t.status === 'failed' || t.status === 'cancelled');
    if (pendingTasks.length === 0) return;

    setIsUploading(true);
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const queue = [...pendingTasks];
    const CONCURRENCY_LIMIT = 3;

    const worker = async () => {
      while (queue.length > 0) {
        // Double check: Has uploading been completely stopped?
        const nextTask = queue.shift();
        if (!nextTask) break;

        // Double check task is still runnable (not deleted or cancelled)
        const check = tasksRef.current.find((t) => t.id === nextTask.id);
        if (!check || check.status === 'cancelled') continue;

        await uploadTask(nextTask.id);
      }
    };

    const activeBatchId = pendingTasks[0]?.batchId;
    if (activeBatchId) {
      addNotification({
        id: activeBatchId,
        title: 'Uploading Photos...',
        description: `Starting upload of ${pendingTasks.length} photos.`,
        category: 'upload',
        priority: 'low',
        progress: 0,
      });
    }

    const workers = Array.from(
      { length: Math.min(CONCURRENCY_LIMIT, queue.length) },
      worker
    );

    await Promise.all(workers);
    setIsUploading(false);

    if (activeBatchId) {
      const batchTasks = tasksRef.current.filter((t) => t.batchId === activeBatchId);
      const completed = batchTasks.filter((t) => t.status === 'completed').length;
      const failed = batchTasks.filter((t) => t.status === 'failed').length;

      if (completed > 0) {
        updateNotification(activeBatchId, {
          title: '✅ Upload Complete',
          description: `${completed} photos uploaded successfully. AI processing has started.`,
          category: 'success',
          priority: 'medium',
          progress: 100,
        });

        // Trigger AI Processing Started notification
        addNotification({
          id: `ai-${activeBatchId}`,
          title: '🤖 AI Processing Started',
          description: `Analyzing ${completed} uploaded photos. Guests will be able to search once completed.`,
          category: 'ai',
          priority: 'medium',
          progress: 0,
        });
      } else if (failed > 0) {
        updateNotification(activeBatchId, {
          title: '❌ Upload Failed',
          description: `Failed to upload ${failed} photos. Click retry to resume.`,
          category: 'error',
          priority: 'high',
          progress: 100,
        });
      }
    }
  };

  const cancelUpload = (taskId: string) => {
    // 1. Abort connection
    if (xhrRef.current[taskId]) {
      xhrRef.current[taskId].abort();
      delete xhrRef.current[taskId];
    }

    // 2. Mark as cancelled in state
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          if (t.status !== 'completed') {
            URL.revokeObjectURL(t.previewUrl);
            return { ...t, status: 'cancelled', error: 'Upload cancelled' };
          }
        }
        return t;
      })
    );
  };

  const cancelBatch = (batchId: string) => {
    const batchTasks = tasksRef.current.filter((t) => t.batchId === batchId);
    batchTasks.forEach((task) => {
      cancelUpload(task.id);
    });
  };

  const retryTask = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'waiting', progress: 0, uploadedBytes: 0, error: undefined, retryCount: 0 } : t
      )
    );

    setTimeout(() => {
      startUpload();
    }, 0);
  };

  const retryFailed = async () => {
    const failedTasks = tasksRef.current.filter((t) => t.status === 'failed');
    if (failedTasks.length === 0) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.status === 'failed' ? { ...t, status: 'waiting', progress: 0, uploadedBytes: 0, error: undefined, retryCount: 0 } : t
      )
    );

    setTimeout(() => {
      startUpload();
    }, 0);
  };

  // Clear completed and cancelled tasks, preserving failed ones for user to verify/retry
  const clearCompleted = () => {
    const completedOrCancelled = tasksRef.current.filter(
      (t) => t.status === 'completed' || t.status === 'cancelled'
    );
    
    completedOrCancelled.forEach((t) => {
      URL.revokeObjectURL(t.previewUrl);
    });

    setTasks((prev) => prev.filter((t) => t.status !== 'completed' && t.status !== 'cancelled'));
  };

  const clearQueue = () => {
    Object.keys(xhrRef.current).forEach((taskId) => {
      xhrRef.current[taskId].abort();
      delete xhrRef.current[taskId];
    });

    tasksRef.current.forEach((t) => {
      URL.revokeObjectURL(t.previewUrl);
    });

    setTasks([]);
    setIsUploading(false);
  };

  // Derived state counters (aligned with user naming guidelines)
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const activeCount = tasks.filter((t) => t.status === 'uploading' || t.status === 'registering').length;
  const pendingCount = tasks.filter((t) => t.status === 'waiting').length;
  const completedAiCount = tasks.filter((t) => t.status === 'completed' && t.aiStatus && t.aiStatus !== 'pending').length;

  const totalTasks = tasks.length;
  const uploadProgress =
    totalTasks > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
      : 0;

  return (
    <UploadContext.Provider
      value={{
        tasks,
        isUploading,
        addFiles,
        startUpload,
        cancelUpload,
        cancelBatch,
        retryFailed,
        retryTask,
        clearCompleted,
        clearQueue,
        completedCount,
        failedCount,
        activeCount,
        pendingCount,
        uploadProgress,
        speed,
        eta,
        aiProcessing,
        completedAiCount,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUploadContext must be used within an UploadProvider');
  }
  return context;
}

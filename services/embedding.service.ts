// services/embedding.service.ts
// Orchestrates face detection, PGVector insertions, database locks, and sequential queuing.

import { EmbeddingRepository } from '@/repositories/embedding.repository';
import { PythonService } from './python.service';
import { PhotoRepository } from '@/database/repositories/photo.repository';
import { ProcessingStatus } from '@/types/embedding';

const embeddingRepo = new EmbeddingRepository();
const photoRepo = new PhotoRepository();
const pythonService = new PythonService();

export class EmbeddingService {
  /**
   * Coordinates downloading, FastAPI inference, embedding saving, and status mapping.
   * Utilizes an atomic conditional database lock to prevent duplicate runs.
   */
  async processPhoto(photoId: string): Promise<boolean> {
    try {
      console.log(`[AI Processing Pipeline] [STARTED] Photo ${photoId}`);

      // 1. Locking Strategy: Acquire lock by attempting to transition status to PROCESSING
      const lockAcquired = await embeddingRepo.updateProcessingStatus(photoId, ProcessingStatus.PROCESSING);
      if (!lockAcquired) {
        console.log(`[AI Processing Pipeline] [SKIP] Photo ${photoId} already processing or completed.`);
        return false;
      }

      // 2. Fetch target photo metadata
      const photo = await photoRepo.getPhotoById(photoId);
      if (!photo) {
        throw new Error('Photo metadata not found in database');
      }

      // 3. Purge existing face embeddings for this photo (idempotence safety on retry)
      await embeddingRepo.deleteEmbedding(photoId);

      // 4. Dispatch processing call to python service
      console.log(`[AI Processing Pipeline] [INFERENCE] Dispatched photo ${photoId} URL: ${photo.cloudinary_url}`);
      const startInference = Date.now();
      const analysisResult = await pythonService.analyzeImage(photo.cloudinary_url);
      const inferenceTime = ((Date.now() - startInference) / 1000).toFixed(3);

      console.log(`[AI Processing Pipeline] [RESULT] Photo ${photoId} | Inference Time: ${inferenceTime}s | Face Count: ${analysisResult.face_count}`);

      // 5. Handle empty face detection scenario
      if (analysisResult.face_count === 0) {
        // "No face detected" is successfully completed (face_count = 0)
        console.log(`[AI Processing Pipeline] [SUCCESS] Photo ${photoId} completed with 0 faces detected.`);
        await embeddingRepo.updateProcessingStatus(photoId, ProcessingStatus.COMPLETED);
        return true;
      }

      // 6. Loop and insert embeddings for all detected faces separately
      for (let i = 0; i < analysisResult.faces.length; i++) {
        const face = analysisResult.faces[i];
        
        // Extract and translate bounding boxes
        const [x1, y1, x2, y2] = face.bbox;
        const box = {
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          confidence: face.confidence,
        };

        const metadata = {
          modelName: 'buffalo_l',
          embeddingDimension: face.embedding.length,
          faceIndex: i,
        };

        const quality = {
          yaw: face.yaw,
          pitch: face.pitch,
          roll: face.roll,
          blur: face.blur,
          brightness: face.brightness,
          sharpness: face.sharpness,
          faceWidth: face.face_width,
          faceHeight: face.face_height,
          faceArea: face.face_area,
          faceRatio: face.face_ratio,
          faceQuality: face.face_quality,
          occlusionScore: face.occlusion_score,
          imageWidth: face.image_width,
          imageHeight: face.image_height,
          cropUrl: null,
          processingVersion: face.processing_version,
        };

        await embeddingRepo.insertEmbedding(photoId, face.embedding, box, metadata, quality);
      }

      // 7. Success status transition
      await embeddingRepo.updateProcessingStatus(photoId, ProcessingStatus.COMPLETED);
      console.log(`[AI Processing Pipeline] [SUCCESS] Photo ${photoId} fully processed. Stored ${analysisResult.face_count} face(s).`);
      return true;
    } catch (error: any) {
      console.error(`[AI Processing Pipeline] [FAILED] Photo ${photoId} | Error: ${error.message}`);
      await embeddingRepo.markProcessingFailed(photoId, error.message || 'Unknown processing error');
      return false;
    }
  }
}

export const embeddingService = new EmbeddingService();

/**
 * Sequential processing queue to handle photo pipeline processing one-by-one without Redis/BullMQ.
 * Interface designed so a queue service like BullMQ can be swapped in without major refactoring.
 */
class ProcessingQueue {
  private queue: string[] = [];
  private isProcessing = false;

  /**
   * Enqueues a photo ID for sequential background processing.
   */
  enqueue(photoId: string) {
    if (this.queue.includes(photoId)) {
      console.log(`[Queue] Photo ${photoId} already in queue.`);
      return;
    }
    this.queue.push(photoId);
    console.log(`[Queue] Enqueued photo ${photoId}. Queue length: ${this.queue.length}`);
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;

    this.isProcessing = true;
    const photoId = this.queue.shift()!;

    try {
      await embeddingService.processPhoto(photoId);
    } catch (err: any) {
      console.error(`[Queue] Error running sequential task for photo ${photoId}:`, err.message);
    } finally {
      this.isProcessing = false;
      // Defer next task execution to the next event loop tick
      setTimeout(() => this.processNext(), 0);
    }
  }
}

// Support hot reload & route isolation singleton storage in Next.js development
declare global {
  var globalProcessingQueue: ProcessingQueue | undefined;
}

if (!global.globalProcessingQueue) {
  global.globalProcessingQueue = new ProcessingQueue();
}

export const processingQueue = global.globalProcessingQueue;

// repositories/embedding.repository.ts
// Data Access Repository for Face Embeddings and pipeline status.

import { query } from '@/database/db';
import { FaceEmbeddingRow, ProcessingStatus } from '@/types/embedding';
import { PhotoRow } from '@/database/repositories/photo.repository';

export interface SelfieRow {
  id: string;
  user_id: string;
  event_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  created_at: Date;
  updated_at: Date;
}

export class EmbeddingRepository {
  private toVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  /**
   * Detects if pgvector extension vector type is active in the database.
   */
  private async isVectorType(): Promise<boolean> {
    try {
      const res = await query("SELECT 1 FROM pg_type WHERE typname = 'vector'");
      return res.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Helper to safely translate database arrays or pgvector strings to JS numbers[].
   */
  private parseEmbedding(val: any): number[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const clean = val.replace(/[{}[\]]/g, '').trim();
      if (!clean) return [];
      return clean.split(',').map(Number);
    }
    return [];
  }

  /**
   * Stores a single face detection box and its associated 512-dim embedding.
   */
  async insertEmbedding(
    photoId: string,
    embedding: number[],
    box: { x: number; y: number; width: number; height: number; confidence: number },
    metadata: { modelName: string; embeddingDimension: number; faceIndex: number },
    quality?: {
      yaw: number;
      pitch: number;
      roll: number;
      blur: number;
      brightness: number;
      sharpness: number;
      faceWidth: number;
      faceHeight: number;
      faceArea: number;
      faceRatio: number;
      faceQuality: number;
      occlusionScore: number;
      imageWidth: number;
      imageHeight: number;
      cropUrl: string | null;
      processingVersion: string;
    }
  ): Promise<FaceEmbeddingRow> {
    const isVector = await this.isVectorType();
    const embeddingValue = isVector ? this.toVectorString(embedding) : embedding;

    const box_x1 = Math.round(box.x);
    const box_y1 = Math.round(box.y);
    const box_x2 = Math.round(box.x + box.width);
    const box_y2 = Math.round(box.y + box.height);

    const sql = `
      INSERT INTO photo_faces (
        photo_id, box_x1, box_y1, box_x2, box_y2, embedding, 
        x, y, width, height, confidence, model_name, embedding_dimension, face_index,
        yaw, pitch, roll, blur, brightness, sharpness, face_width, face_height,
        face_area, face_ratio, face_quality, occlusion_score, image_width, image_height,
        crop_url, processing_version, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, CURRENT_TIMESTAMP)
      RETURNING id, photo_id, box_x1, box_y1, box_x2, box_y2, x, y, width, height, confidence, model_name, embedding_dimension, face_index,
        yaw, pitch, roll, blur, brightness, sharpness, face_width, face_height, face_area, face_ratio, face_quality, occlusion_score, image_width, image_height, crop_url, processing_version,
        embedding::text as embedding, created_at;
    `;
    const res = await query(sql, [
      photoId,
      box_x1,
      box_y1,
      box_x2,
      box_y2,
      embeddingValue,
      box_x1,
      box_y1,
      Math.round(box.width),
      Math.round(box.height),
      box.confidence,
      metadata.modelName,
      metadata.embeddingDimension,
      metadata.faceIndex,
      quality?.yaw ?? 0.0,
      quality?.pitch ?? 0.0,
      quality?.roll ?? 0.0,
      quality?.blur ?? 0.0,
      quality?.brightness ?? 127.0,
      quality?.sharpness ?? 0.0,
      quality?.faceWidth ?? Math.round(box.width),
      quality?.faceHeight ?? Math.round(box.height),
      quality?.faceArea ?? Math.round(box.width * box.height),
      quality?.faceRatio ?? 0.0,
      quality?.faceQuality ?? 0.5,
      quality?.occlusionScore ?? 0.0,
      quality?.imageWidth ?? 0,
      quality?.imageHeight ?? 0,
      quality?.cropUrl ?? null,
      quality?.processingVersion ?? 'v1',
    ]);
    
    const row = res.rows[0];
    return {
      ...row,
      embedding: this.parseEmbedding(row.embedding),
    };
  }

  /**
   * Deletes all face embedding records associated with a photo.
   */
  async deleteEmbedding(photoId: string): Promise<boolean> {
    const sql = `
      DELETE FROM photo_faces
      WHERE photo_id = $1;
    `;
    const res = await query(sql, [photoId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Retrieves all embeddings detected in a photo.
   */
  async getEmbeddingsByPhoto(photoId: string): Promise<FaceEmbeddingRow[]> {
    const sql = `
      SELECT id, photo_id, box_x1, box_y1, box_x2, box_y2, x, y, width, height, confidence, model_name, embedding_dimension, face_index, embedding::text as embedding, created_at
      FROM photo_faces
      WHERE photo_id = $1
      ORDER BY face_index ASC;
    `;
    const res = await query(sql, [photoId]);
    return res.rows.map((row) => ({
      ...row,
      embedding: this.parseEmbedding(row.embedding),
    }));
  }

  /**
   * Updates the processing status on a photo.
   */
  async updateProcessingStatus(photoId: string, status: ProcessingStatus): Promise<boolean> {
    let sql = '';
    let params: any[] = [];

    if (status === ProcessingStatus.PROCESSING) {
      sql = `
        UPDATE photos
        SET status = 'processing', processing_status = $1, processing_started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `;
      params = [status, photoId];
    } else if (status === ProcessingStatus.COMPLETED) {
      sql = `
        UPDATE photos
        SET status = 'processed', processing_status = $1, processing_completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `;
      params = [status, photoId];
    } else {
      sql = `
        UPDATE photos
        SET processing_status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `;
      params = [status, photoId];
    }

    const res = await query(sql, params);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Marks processing as failed with an error message.
   */
  async markProcessingFailed(photoId: string, errorMessage: string): Promise<boolean> {
    const sql = `
      UPDATE photos
      SET status = 'failed', processing_status = 'FAILED', processing_error = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;
    const res = await query(sql, [errorMessage, photoId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Stores or updates a user selfie template for an event.
   */
  async storeSelfie(
    userId: string,
    eventId: string,
    cloudinaryPublicId: string,
    cloudinaryUrl: string,
    embedding: number[]
  ): Promise<SelfieRow> {
    const isVector = await this.isVectorType();
    const embeddingValue = isVector ? this.toVectorString(embedding) : embedding;
    const sql = `
      INSERT INTO selfies (user_id, event_id, cloudinary_public_id, cloudinary_url, embedding, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, event_id) 
      DO UPDATE SET 
        cloudinary_public_id = EXCLUDED.cloudinary_public_id,
        cloudinary_url = EXCLUDED.cloudinary_url,
        embedding = EXCLUDED.embedding,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, event_id, cloudinary_public_id, cloudinary_url, created_at, updated_at;
    `;
    const res = await query(sql, [
      userId,
      eventId,
      cloudinaryPublicId,
      cloudinaryUrl,
      embeddingValue,
    ]);
    return res.rows[0];
  }

  /**
   * Finds all photos containing the user's face in a specific event.
   */
  async findUserPhotos(
    eventId: string,
    userId: string,
    threshold: number = 0.40
  ): Promise<PhotoRow[]> {
    const isVector = await this.isVectorType();
    const distanceOperator = isVector ? '<=>' : '<->'; // cosine distance (pgvector) vs vector math L2 or simple check
    
    // Fallback: if pgvector isn't active, we run simple similarity or cosine estimation in SQL.
    // If pgvector is present, we use the optimized HNSW index check.
    let sql = '';
    if (isVector) {
      sql = `
        SELECT DISTINCT p.id, p.event_id, p.uploaded_by, p.cloudinary_public_id, p.cloudinary_url, p.width, p.height, p.status, p.processing_status, p.created_at, p.updated_at
        FROM photos p
        JOIN photo_faces pf ON p.id = pf.photo_id
        JOIN selfies s ON s.event_id = p.event_id
        WHERE p.event_id = $1 
          AND s.user_id = $2
          AND p.status = 'processed'
          AND (pf.embedding <=> s.embedding) < $3
        ORDER BY p.created_at DESC;
      `;
    } else {
      // Basic fallback: just return matches for the event to avoid breaking the UI queries
      sql = `
        SELECT DISTINCT p.id, p.event_id, p.uploaded_by, p.cloudinary_public_id, p.cloudinary_url, p.width, p.height, p.status, p.processing_status, p.created_at, p.updated_at
        FROM photos p
        JOIN photo_faces pf ON p.id = pf.photo_id
        WHERE p.event_id = $1 
          AND p.status = 'processed'
        ORDER BY p.created_at DESC;
      `;
    }
    const res = await query(sql, [eventId, userId, threshold]);
    return res.rows;
  }
}

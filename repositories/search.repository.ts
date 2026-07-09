// repositories/search.repository.ts
import { query } from '@/database/db';
import { MatchedPhotoRow } from '@/types/selfie';

export class SearchRepository {
  private toVectorString(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  private async isVectorType(): Promise<boolean> {
    try {
      const res = await query("SELECT 1 FROM pg_type WHERE typname = 'vector'");
      return res.rows.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Search all face embeddings within a specific event matching the selfie embedding.
   */
  async vectorSearch(
    eventId: string,
    selfieEmbedding: number[],
    threshold: number,
    limit = 500
  ): Promise<MatchedPhotoRow[]> {
    const isVector = await this.isVectorType();

    if (isVector) {
      const vectorStr = this.toVectorString(selfieEmbedding);
      const sql = `
        SELECT 
          p.id AS photo_id,
          p.event_id,
          p.uploaded_by,
          COALESCE(u.name, 'Unknown') AS uploader_name,
          p.cloudinary_public_id,
          p.cloudinary_url,
          p.width,
          p.height,
          p.created_at AS photo_created_at,
          pf.id AS face_id,
          pf.x,
          pf.y,
          pf.width AS face_width,
          pf.height AS face_height,
          pf.confidence AS face_confidence,
          pf.face_index,
          pf.yaw,
          pf.pitch,
          pf.roll,
          pf.blur,
          pf.brightness,
          pf.sharpness,
          pf.face_area,
          pf.face_ratio,
          pf.face_quality,
          pf.occlusion_score,
          pf.image_width,
          pf.image_height,
          pf.crop_url,
          pf.processing_version,
          (1 - (pf.embedding <=> $2::vector(512))) AS similarity
        FROM photos p
        JOIN photo_faces pf ON p.id = pf.photo_id
        LEFT JOIN users u ON p.uploaded_by = u.id
        WHERE p.event_id = $1 
          AND p.status = 'processed'
          AND (1 - (pf.embedding <=> $2::vector(512))) >= $3
        ORDER BY similarity DESC
        LIMIT $4;
      `;
      const res = await query(sql, [eventId, vectorStr, threshold, limit]);
      return res.rows.map((row) => ({
        photo_id: row.photo_id,
        event_id: row.event_id,
        uploaded_by: row.uploaded_by,
        uploader_name: row.uploader_name,
        cloudinary_public_id: row.cloudinary_public_id,
        cloudinary_url: row.cloudinary_url,
        width: Number(row.width),
        height: Number(row.height),
        photo_created_at: new Date(row.photo_created_at),
        face_id: row.face_id,
        x: Number(row.x),
        y: Number(row.y),
        face_width: Number(row.face_width),
        face_height: Number(row.face_height),
        face_confidence: Number(row.face_confidence),
        face_index: Number(row.face_index),
        yaw: Number(row.yaw ?? 0.0),
        pitch: Number(row.pitch ?? 0.0),
        roll: Number(row.roll ?? 0.0),
        blur: Number(row.blur ?? 0.0),
        brightness: Number(row.brightness ?? 127.0),
        sharpness: Number(row.sharpness ?? 0.0),
        face_area: Number(row.face_area ?? 0),
        face_ratio: Number(row.face_ratio ?? 0.0),
        face_quality: Number(row.face_quality ?? 0.5),
        occlusion_score: Number(row.occlusion_score ?? 0.0),
        image_width: Number(row.image_width ?? 0),
        image_height: Number(row.image_height ?? 0),
        crop_url: row.crop_url,
        processing_version: row.processing_version ?? 'v1',
        similarity: Number(row.similarity),
      }));
    } else {
      // Fallback: Fetch all face embeddings for the event and compute cosine similarity in JS
      const sql = `
        SELECT 
          p.id AS photo_id,
          p.event_id,
          p.uploaded_by,
          COALESCE(u.name, 'Unknown') AS uploader_name,
          p.cloudinary_public_id,
          p.cloudinary_url,
          p.width,
          p.height,
          p.created_at AS photo_created_at,
          pf.id AS face_id,
          pf.x,
          pf.y,
          pf.width AS face_width,
          pf.height AS face_height,
          pf.confidence AS face_confidence,
          pf.face_index,
          pf.yaw,
          pf.pitch,
          pf.roll,
          pf.blur,
          pf.brightness,
          pf.sharpness,
          pf.face_area,
          pf.face_ratio,
          pf.face_quality,
          pf.occlusion_score,
          pf.image_width,
          pf.image_height,
          pf.crop_url,
          pf.processing_version,
          pf.embedding::text as embedding
        FROM photos p
        JOIN photo_faces pf ON p.id = pf.photo_id
        LEFT JOIN users u ON p.uploaded_by = u.id
        WHERE p.event_id = $1 
          AND p.status = 'processed';
      `;
      const res = await query(sql, [eventId]);
  
      const parseEmbedding = (val: string): number[] => {
        const clean = val.replace(/[{}[\]]/g, '').trim();
        if (!clean) return [];
        return clean.split(',').map(Number);
      };
  
      const cosineSimilarity = (a: number[], b: number[]): number => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i] * b[i];
          normA += a[i] * a[i];
          normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      };
  
      const results: MatchedPhotoRow[] = res.rows.map((row) => {
        const faceEmb = parseEmbedding(row.embedding);
        const similarity = cosineSimilarity(faceEmb, selfieEmbedding);
        return {
          photo_id: row.photo_id,
          event_id: row.event_id,
          uploaded_by: row.uploaded_by,
          uploader_name: row.uploader_name,
          cloudinary_public_id: row.cloudinary_public_id,
          cloudinary_url: row.cloudinary_url,
          width: Number(row.width),
          height: Number(row.height),
          photo_created_at: new Date(row.photo_created_at),
          face_id: row.face_id,
          x: Number(row.x),
          y: Number(row.y),
          face_width: Number(row.face_width),
          face_height: Number(row.face_height),
          face_confidence: Number(row.face_confidence),
          face_index: Number(row.face_index),
          yaw: Number(row.yaw ?? 0.0),
          pitch: Number(row.pitch ?? 0.0),
          roll: Number(row.roll ?? 0.0),
          blur: Number(row.blur ?? 0.0),
          brightness: Number(row.brightness ?? 127.0),
          sharpness: Number(row.sharpness ?? 0.0),
          face_area: Number(row.face_area ?? 0),
          face_ratio: Number(row.face_ratio ?? 0.0),
          face_quality: Number(row.face_quality ?? 0.5),
          occlusion_score: Number(row.occlusion_score ?? 0.0),
          image_width: Number(row.image_width ?? 0),
          image_height: Number(row.image_height ?? 0),
          crop_url: row.crop_url,
          processing_version: row.processing_version ?? 'v1',
          similarity,
        };
      });
  
      // Filter, sort and slice to limit
      return results
        .filter((r) => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    }
  }
}

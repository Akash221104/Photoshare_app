// repositories/download.repository.ts
import { query } from '@/database/db';
import { PhotoRow } from '@/database/repositories/photo.repository';
import { SearchRepository } from './search.repository';
import { SelfieRepository } from './selfie.repository';
import { MatchedPhotoRow } from '@/types/selfie';

const searchRepo = new SearchRepository();
const selfieRepo = new SelfieRepository();

export class DownloadRepository {
  /**
   * Fetches all photos uploaded by the user in a specific event.
   */
  async getUserUploads(eventId: string, userId: string): Promise<PhotoRow[]> {
    const sql = `
      SELECT p.*, COALESCE(u.name, 'Unknown') AS uploader_name
      FROM photos p
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.event_id = $1 AND p.uploaded_by = $2
      ORDER BY p.created_at DESC;
    `;
    const res = await query(sql, [eventId, userId]);
    return res.rows;
  }

  /**
   * Fetches all AI matched photos of the user in a specific event.
   */
  async getUserMatches(eventId: string, userId: string, threshold = 0.40): Promise<MatchedPhotoRow[]> {
    const selfie = await selfieRepo.getUserSelfie(userId, eventId);
    if (!selfie) return [];

    const rawMatches = await searchRepo.vectorSearch(eventId, selfie.embedding, threshold);

    // Group by photo_id, keeping only the highest similarity face match per photo
    const uniqueMap = new Map<string, MatchedPhotoRow>();
    for (const match of rawMatches) {
      const existing = uniqueMap.get(match.photo_id);
      if (!existing || match.similarity > existing.similarity) {
        uniqueMap.set(match.photo_id, match);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Fetches multiple photos by their IDs.
   */
  async getSelectedPhotos(photoIds: string[]): Promise<PhotoRow[]> {
    if (photoIds.length === 0) return [];
    const sql = `
      SELECT p.*, COALESCE(u.name, 'Unknown') AS uploader_name
      FROM photos p
      LEFT JOIN users u ON p.uploaded_by = u.id
      WHERE p.id = ANY($1);
    `;
    const res = await query(sql, [photoIds]);
    return res.rows;
  }

  /**
   * Checks if a user has permission to download a specific photo.
   * Permission is granted if the user uploaded the photo OR if the user appears in the photo (AI match).
   */
  async validateOwnership(photoId: string, userId: string, eventId: string, threshold = 0.40): Promise<boolean> {
    // 1. Check if the user is the uploader of the photo
    const uploaderCheckSql = `
      SELECT 1 FROM photos 
      WHERE id = $1 AND uploaded_by = $2;
    `;
    const uploaderRes = await query(uploaderCheckSql, [photoId, userId]);
    if (uploaderRes.rows.length > 0) {
      return true;
    }

    // 2. Check if the user appears in the photo (AI Match)
    const selfie = await selfieRepo.getUserSelfie(userId, eventId);
    if (!selfie) return false;

    // Get all face embeddings for this specific photo
    const facesSql = `
      SELECT embedding 
      FROM photo_faces 
      WHERE photo_id = $1;
    `;
    const facesRes = await query(facesSql, [photoId]);
    if (facesRes.rows.length === 0) return false;

    // Check if any face matches the selfie embedding above the threshold
    // Let's use the search repository's similarity check or dynamic vector check
    const isVector = await query("SELECT 1 FROM pg_type WHERE typname = 'vector'").then(r => r.rows.length > 0).catch(() => false);
    
    if (isVector) {
      const matchSql = `
        SELECT 1 
        FROM photo_faces pf
        JOIN selfies s ON s.user_id = $2 AND s.event_id = $3
        WHERE pf.photo_id = $1 
          AND (1 - (pf.embedding <=> s.embedding)) >= $4
        LIMIT 1;
      `;
      const matchRes = await query(matchSql, [photoId, userId, eventId, threshold]);
      return matchRes.rows.length > 0;
    } else {
      // Fallback: JS similarity matching
      const targetEmbedding = selfie.embedding;
      for (const row of facesRes.rows) {
        // Parse database vector representation (string or array)
        let faceEmbedding: number[] = [];
        if (typeof row.embedding === 'string') {
          faceEmbedding = row.embedding.replace('[', '').replace(']', '').split(',').map(Number);
        } else if (Array.isArray(row.embedding)) {
          faceEmbedding = row.embedding;
        }

        // Cosine similarity
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < targetEmbedding.length; i++) {
          dotProduct += targetEmbedding[i] * faceEmbedding[i];
          normA += targetEmbedding[i] * targetEmbedding[i];
          normB += faceEmbedding[i] * faceEmbedding[i];
        }
        const similarity = normA > 0 && normB > 0 ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
        if (similarity >= threshold) {
          return true;
        }
      }
    }

    return false;
  }
}

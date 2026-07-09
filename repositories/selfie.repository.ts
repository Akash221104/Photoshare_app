// repositories/selfie.repository.ts
import { query } from '@/database/db';
import { SelfieRow } from '@/types/selfie';

export class SelfieRepository {
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

  private parseEmbedding(val: any): number[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const clean = val.replace(/[{}[\]]/g, '').trim();
      if (!clean) return [];
      return clean.split(',').map(Number);
    }
    return [];
  }

  async getUserSelfie(userId: string, eventId: string): Promise<SelfieRow | null> {
    const sql = `
      SELECT id, user_id, event_id, cloudinary_public_id, cloudinary_url, embedding::text as embedding, created_at, updated_at
      FROM selfies
      WHERE user_id = $1 AND event_id = $2;
    `;
    const res = await query(sql, [userId, eventId]);
    if (res.rows.length === 0) return null;
    
    const row = res.rows[0];
    return {
      ...row,
      embedding: this.parseEmbedding(row.embedding)
    };
  }

  async createSelfie(
    userId: string,
    eventId: string,
    publicId: string,
    url: string,
    embedding: number[]
  ): Promise<SelfieRow> {
    const isVector = await this.isVectorType();
    const embeddingValue = isVector ? this.toVectorString(embedding) : embedding;
    const sql = `
      INSERT INTO selfies (user_id, event_id, cloudinary_public_id, cloudinary_url, embedding, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, user_id, event_id, cloudinary_public_id, cloudinary_url, embedding::text as embedding, created_at, updated_at;
    `;
    const res = await query(sql, [userId, eventId, publicId, url, embeddingValue]);
    const row = res.rows[0];
    return {
      ...row,
      embedding: this.parseEmbedding(row.embedding)
    };
  }

  async updateSelfie(
    userId: string,
    eventId: string,
    publicId: string,
    url: string,
    embedding: number[]
  ): Promise<SelfieRow> {
    const isVector = await this.isVectorType();
    const embeddingValue = isVector ? this.toVectorString(embedding) : embedding;
    const sql = `
      UPDATE selfies
      SET 
        cloudinary_public_id = $3,
        cloudinary_url = $4,
        embedding = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND event_id = $2
      RETURNING id, user_id, event_id, cloudinary_public_id, cloudinary_url, embedding::text as embedding, created_at, updated_at;
    `;
    const res = await query(sql, [userId, eventId, publicId, url, embeddingValue]);
    const row = res.rows[0];
    return {
      ...row,
      embedding: this.parseEmbedding(row.embedding)
    };
  }

  async deleteSelfie(userId: string, eventId: string): Promise<boolean> {
    const sql = `
      DELETE FROM selfies
      WHERE user_id = $1 AND event_id = $2;
    `;
    const res = await query(sql, [userId, eventId]);
    return (res.rowCount ?? 0) > 0;
  }
}

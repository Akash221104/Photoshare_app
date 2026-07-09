// database/repositories/photo.repository.ts
// Data Access Repository for Photos.
// Encapsulates raw SQL queries. Does not contain business logic.

import { query } from '../db';

export interface PhotoRow {
  id: string;
  event_id: string;
  uploaded_by: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  width: number;
  height: number;
  status: 'processing' | 'processed' | 'failed';
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processing_started_at?: Date | null;
  processing_completed_at?: Date | null;
  processing_error?: string | null;
  created_at: Date;
  updated_at: Date;
}

export class PhotoRepository {
  /**
   * Registers a new photo metadata record (default status is 'processing', processing_status is 'PENDING').
   */
  async uploadPhoto(
    eventId: string,
    uploadedBy: string,
    cloudinaryPublicId: string,
    cloudinaryUrl: string,
    width: number,
    height: number
  ): Promise<PhotoRow> {
    const sql = `
      INSERT INTO photos (
        event_id, uploaded_by, cloudinary_public_id, cloudinary_url, 
        width, height, status, processing_status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'processing', 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at;
    `;
    const res = await query(sql, [
      eventId,
      uploadedBy,
      cloudinaryPublicId,
      cloudinaryUrl,
      width,
      height,
    ]);
    return res.rows[0];
  }

  /**
   * Updates the processing status of a photo (e.g. 'processed' or 'failed').
   */
  async updatePhotoStatus(
    photoId: string,
    status: 'processing' | 'processed' | 'failed'
  ): Promise<PhotoRow | null> {
    const sql = `
      UPDATE photos
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at;
    `;
    const res = await query(sql, [status, photoId]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Retrieves a photo's metadata by its ID.
   */
  async getPhotoById(photoId: string): Promise<PhotoRow | null> {
    const sql = `
      SELECT id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at
      FROM photos
      WHERE id = $1;
    `;
    const res = await query(sql, [photoId]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Retrieves all fully processed photos for an event's collaborative gallery.
   */
  async getGallery(eventId: string): Promise<PhotoRow[]> {
    const sql = `
      SELECT id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at
      FROM photos
      WHERE event_id = $1 AND status = 'processed'
      ORDER BY created_at DESC;
    `;
    const res = await query(sql, [eventId]);
    return res.rows;
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    const sql = `
      DELETE FROM photos
      WHERE id = $1;
    `;
    const res = await query(sql, [photoId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Counts the total number of processed photos in an event.
   */
  async countPhotos(eventId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM photos
      WHERE event_id = $1;
    `;
    const res = await query(sql, [eventId]);
    return parseInt(res.rows[0].count, 10);
  }

  /**
   * Fetches paginated photos for an event's collaborative gallery.
   */
  async getPhotosByEvent(
    eventId: string,
    limit: number,
    offset: number
  ): Promise<PhotoRow[]> {
    const sql = `
      SELECT id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at
      FROM photos
      WHERE event_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const res = await query(sql, [eventId, limit, offset]);
    return res.rows;
  }

  /**
   * Retrieves the most recently uploaded processed photo for an event.
   */
  async getLatestPhoto(eventId: string): Promise<PhotoRow | null> {
    const sql = `
      SELECT id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, processing_status, processing_started_at, processing_completed_at, processing_error, created_at, updated_at
      FROM photos
      WHERE event_id = $1 AND status = 'processed'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const res = await query(sql, [eventId]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }
}

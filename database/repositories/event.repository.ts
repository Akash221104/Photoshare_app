// database/repositories/event.repository.ts
// Data Access Repository for Events.
// Encapsulates raw SQL queries. Does not contain business logic.

import { query, getClient } from '../db';

export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  host_id: string;
  upload_mode: 'ALL' | 'HOST_ONLY';
  created_at: Date;
  updated_at: Date;
  photo_count?: number;
  cover_url?: string | null;
  member_count?: number;
}

export class EventRepository {
  /**
   * Creates a new event and automatically adds the host as an owner/admin member in a TRANSACTION.
   */
  async createEvent(
    name: string,
    description: string | null,
    joinCode: string,
    hostId: string,
    uploadMode: 'ALL' | 'HOST_ONLY' = 'ALL'
  ): Promise<EventRow> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Insert Event
      const eventSql = `
        INSERT INTO events (name, description, join_code, host_id, upload_mode, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, description, join_code, host_id, upload_mode, created_at, updated_at;
      `;
      const eventRes = await client.query(eventSql, [
        name,
        description,
        joinCode,
        hostId,
        uploadMode,
      ]);
      const newEvent: EventRow = eventRes.rows[0];

      // 2. Insert Host as Member in event_members (with 'host' role)
      const memberSql = `
        INSERT INTO event_members (event_id, user_id, role, joined_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP);
      `;
      await client.query(memberSql, [newEvent.id, hostId, 'host']);

      await client.query('COMMIT');
      return newEvent;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create event in database:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves an event by its ID with real-time stats (photo count & member count).
   */
  async getEventById(id: string): Promise<EventRow | null> {
    const sql = `
      SELECT 
        e.id, 
        e.name, 
        e.description, 
        e.join_code, 
        e.host_id, 
        e.upload_mode, 
        e.created_at, 
        e.updated_at,
        u.name as host_name,
        COALESCE(p.photo_count, 0)::int as photo_count,
        COALESCE(m.member_count, 0)::int as member_count
      FROM events e
      LEFT JOIN users u ON e.host_id = u.id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as photo_count 
        FROM photos 
        GROUP BY event_id
      ) p ON e.id = p.event_id
      LEFT JOIN (
        SELECT event_id, COUNT(*) as member_count 
        FROM event_members 
        GROUP BY event_id
      ) m ON e.id = m.event_id
      WHERE e.id = $1;
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Retrieves an event by its unique 6-character access join code.
   */
  async getEventByJoinCode(joinCode: string): Promise<EventRow | null> {
    const sql = `
      SELECT id, name, description, join_code, host_id, upload_mode, created_at, updated_at
      FROM events
      WHERE join_code = $1;
    `;
    const res = await query(sql, [joinCode]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const sql = `
      DELETE FROM events
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Updates an event name and description.
   */
  async updateEvent(
    id: string,
    name: string,
    description: string | null,
    uploadMode: 'ALL' | 'HOST_ONLY' = 'ALL'
  ): Promise<EventRow | null> {
    const sql = `
      UPDATE events
      SET name = $1, description = $2, upload_mode = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, description, join_code, host_id, upload_mode, created_at, updated_at;
    `;
    const res = await query(sql, [name, description, uploadMode, id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Retrieves all events hosted or joined by a user.
   */
  async getAllEventsForUser(userId: string): Promise<EventRow[]> {
    const sql = `
      SELECT DISTINCT 
        e.id, 
        e.name, 
        e.description, 
        e.join_code, 
        e.host_id, 
        e.upload_mode,
        e.created_at, 
        e.updated_at,
        COALESCE(p_count.val, 0)::int as photo_count,
        p_latest.url as cover_url,
        COALESCE(m_count.val, 0)::int as member_count
      FROM events e
      LEFT JOIN event_members em ON e.id = em.event_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as val FROM photos p WHERE p.event_id = e.id AND p.status = 'processed'
      ) p_count ON true
      LEFT JOIN LATERAL (
        SELECT p.cloudinary_url as url FROM photos p WHERE p.event_id = e.id AND p.status = 'processed' ORDER BY p.created_at DESC LIMIT 1
      ) p_latest ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) as val FROM event_members m WHERE m.event_id = e.id
      ) m_count ON true
      WHERE e.host_id = $1 OR em.user_id = $2
      ORDER BY e.created_at DESC;
    `;
    const res = await query(sql, [userId, userId]);
    return res.rows;
  }
}

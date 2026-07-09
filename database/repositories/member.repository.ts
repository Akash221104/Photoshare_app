// database/repositories/member.repository.ts
// Data Access Repository for Event Members mappings.
// Encapsulates raw SQL queries. Does not contain business logic.

import { query } from '../db';

export interface EventMemberRow {
  id: string;
  event_id: string;
  user_id: string;
  role: 'host' | 'guest' | 'admin';
  joined_at: Date;
}

export class MemberRepository {
  /**
   * Joins a user to an event by adding them to the event_members mapping table.
   */
  async joinEvent(
    eventId: string,
    userId: string,
    role: 'host' | 'guest' | 'admin' = 'guest'
  ): Promise<EventMemberRow> {
    const sql = `
      INSERT INTO event_members (event_id, user_id, role, joined_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (event_id, user_id) 
      DO UPDATE SET role = EXCLUDED.role -- If they join again, update/ensure role mapping
      RETURNING id, event_id, user_id, role, joined_at;
    `;
    const res = await query(sql, [eventId, userId, role]);
    return res.rows[0];
  }

  /**
   * Checks if a user is an active member of an event.
   */
  async isMember(eventId: string, userId: string): Promise<boolean> {
    const sql = `
      SELECT 1 
      FROM event_members 
      WHERE event_id = $1 AND user_id = $2;
    `;
    const res = await query(sql, [eventId, userId]);
    return res.rows.length > 0;
  }

  /**
   * Retrieves all users bound to a specific event.
   */
  async getMembers(eventId: string): Promise<Array<{ user_id: string; name: string; email: string; role: string; joined_at: Date }>> {
    const sql = `
      SELECT em.user_id, u.name, u.email, em.role, em.joined_at
      FROM event_members em
      JOIN users u ON em.user_id = u.id
      WHERE em.event_id = $1
      ORDER BY em.joined_at ASC;
    `;
    const res = await query(sql, [eventId]);
    return res.rows;
  }

  /**
   * Removes a member from an event (used by host).
   */
  async removeMember(eventId: string, userId: string): Promise<boolean> {
    const sql = `
      DELETE FROM event_members
      WHERE event_id = $1 AND user_id = $2;
    `;
    const res = await query(sql, [eventId, userId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Leaves an event (used by guests).
   */
  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    const sql = `
      DELETE FROM event_members
      WHERE event_id = $1 AND user_id = $2 AND role != 'host'; -- Hosts cannot leave their own event
    `;
    const res = await query(sql, [eventId, userId]);
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Gets a member's role in a specific event.
   */
  async getMemberRole(eventId: string, userId: string): Promise<'host' | 'guest' | 'admin' | null> {
    const sql = `
      SELECT role
      FROM event_members
      WHERE event_id = $1 AND user_id = $2;
    `;
    const res = await query(sql, [eventId, userId]);
    if (res.rows.length === 0) return null;
    return res.rows[0].role;
  }
}

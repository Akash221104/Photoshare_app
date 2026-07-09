// database/repositories/user.repository.ts
// Data Access Repository for Users and Auth accounts.
// Encapsulates raw SQL queries. Does not contain business logic.

import { query, getClient } from '../db';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends UserRow {
  password?: string;
}

export class UserRepository {
  /**
   * Creates a new user and sets up their email/password credential account in a TRANSACTION.
   */
  async createUser(
    name: string,
    email: string,
    passwordHash: string,
    image: string | null = null
  ): Promise<UserRow> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Insert user
      const userSql = `
        INSERT INTO users (name, email, email_verified, image, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, email, email_verified, image, created_at, updated_at;
      `;
      const userRes = await client.query(userSql, [name, email, false, image]);
      const newUser: UserRow = userRes.rows[0];

      // 2. Insert account credentials mapping (Better Auth style)
      // Account ID in credential providers matches email, and provider_id matches 'credential'
      const accountSql = `
        INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `;
      const accountId = crypto.randomUUID(); // Node runtime UUID generator
      await client.query(accountSql, [
        accountId,
        email,
        'credential',
        newUser.id,
        passwordHash,
      ]);

      await client.query('COMMIT');
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create user in database:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieves a user by their email, along with their credentials for login verification.
   */
  async getUserByEmail(email: string): Promise<UserWithPassword | null> {
    const sql = `
      SELECT u.id, u.name, u.email, u.email_verified, u.image, u.created_at, u.updated_at, a.password
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id AND a.provider_id = 'credential'
      WHERE u.email = $1;
    `;
    const res = await query(sql, [email]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Retrieves a user by their unique primary key ID.
   */
  async getUserById(id: string): Promise<UserRow | null> {
    const sql = `
      SELECT id, name, email, email_verified, image, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;
    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  /**
   * Updates a user's profile details (name, image).
   */
  async updateUser(id: string, name: string, image: string | null = null): Promise<UserRow | null> {
    const sql = `
      UPDATE users
      SET name = $1, image = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, email_verified, image, created_at, updated_at;
    `;
    const res = await query(sql, [name, image, id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }
}


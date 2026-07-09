// services/auth.service.ts
// Service layer for handling core authentication, encryption, and validation tasks.
// Interfaces directly with the UserRepository layer.

import bcrypt from 'bcryptjs';
import { UserRepository } from '@/database/repositories/user.repository';
import { loginSchema } from '@/schemas/login.schema';
import { registerSchema } from '@/schemas/register.schema';
import { AuthResponse } from '@/types/auth';

const userRepo = new UserRepository();

export class AuthService {
  /**
   * Hashes a plain-text password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifies a plain-text password against a stored bcrypt hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validates registration inputs and hashes passwords on the server side.
   * Note: Better Auth handles the API registration flow, but this service provides
   * server-side checking and custom credential pipeline preparation.
   */
  async validateRegister(payload: any): Promise<AuthResponse> {
    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(', ');
      return { success: false, error: errorMsg };
    }
    return { success: true };
  }

  /**
   * Validates login inputs on the server side.
   */
  async validateLogin(payload: any): Promise<AuthResponse> {
    const result = loginSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(', ');
      return { success: false, error: errorMsg };
    }
    return { success: true };
  }

  /**
   * Directly checks credentials against the database.
   * Useful for internal/custom server verification loops.
   */
  async authenticateCredentials(email: string, password: string): Promise<AuthResponse> {
    try {
      const validation = await this.validateLogin({ email, password });
      if (!validation.success) return validation;

      const user = await userRepo.getUserByEmail(email);
      if (!user || !user.password) {
        return { success: false, error: 'Invalid email or password' };
      }

      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Strip password from returned user data
      const { password: _, ...userData } = user;
      return { success: true, data: userData };
    } catch (error) {
      console.error('Authentication service failure:', error);
      return { success: false, error: 'An unexpected database error occurred' };
    }
  }
}

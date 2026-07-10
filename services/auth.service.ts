// services/auth.service.ts
// DEPRECATED: Neon Auth manages all authentication server-side.
// This file is kept only for any auxiliary server-side schema validation.

import { loginSchema } from '@/schemas/login.schema';
import { registerSchema } from '@/schemas/register.schema';
import { AuthResponse } from '@/types/auth';

export class AuthService {
  /**
   * Validates registration inputs (server-side schema check only).
   * Neon Auth handles the actual registration flow via its API endpoint.
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
   * Validates login inputs (server-side schema check only).
   * Neon Auth handles the actual sign-in flow via its API endpoint.
   */
  async validateLogin(payload: any): Promise<AuthResponse> {
    const result = loginSchema.safeParse(payload);
    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(', ');
      return { success: false, error: errorMsg };
    }
    return { success: true };
  }
}

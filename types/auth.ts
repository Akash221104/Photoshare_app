// types/auth.ts
// Core Auth Types used across repositories, services, actions, and views.

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
}

export interface AuthResponse<T = any> {
  success: boolean;
  error?: string | null;
  data?: T;
}

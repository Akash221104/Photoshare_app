// lib/auth.ts
// Better Auth Server Instance Configuration.
// Connects directly to our PostgreSQL singleton pool and enables Email + Password.

import { betterAuth } from "better-auth";
import { dbPool } from "@/database/db";
import crypto from "crypto";

export const auth = betterAuth({
  database: dbPool,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // Ensure sessions are stored in database
  session: {
    modelName: "sessions",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  user: {
    modelName: "users",
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
});

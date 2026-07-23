// types/event.ts
// Core Event TypeScript definitions.

export interface Event {
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
  host_name?: string | null;
}

export interface Member {
  user_id: string;
  name: string;
  email: string;
  role: 'host' | 'guest' | 'admin';
  joined_at: Date;
}

export interface InviteLink {
  link: string;
  join_code: string;
}

export interface EventResponse<T = any> {
  success: boolean;
  error?: string | null;
  data?: T;
}

// types/photo.ts
// TypeScript interfaces for Photos and Gallery structures.

export interface Photo {
  id: string;
  event_id: string;
  uploaded_by: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  width: number;
  height: number;
  status: 'processing' | 'processed' | 'failed';
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  processing_started_at?: string | Date | null;
  processing_completed_at?: string | Date | null;
  processing_error?: string | null;
  created_at: Date;
  updated_at: Date;
  uploader_name?: string; // Optional joined user name
}

export interface PhotoResponse<T = any> {
  success: boolean;
  error?: string | null;
  data?: T;
}

export interface GalleryResponse {
  photos: Photo[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

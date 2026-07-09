// schemas/upload.schema.ts
// Zod schemas to validate media upload parameters.

import { z } from 'zod';

export const uploadPhotoSchema = z.object({
  eventId: z.string().uuid({ message: 'Invalid Event ID' }),
});

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;

// schemas/processing.schema.ts
// Zod schemas to validate photo processing and retry requests.

import { z } from 'zod';

export const processPhotoSchema = z.object({
  photoId: z.string().uuid({ message: 'Invalid Photo ID' }),
});

export const retryPhotoSchema = z.object({
  photoId: z.string().uuid({ message: 'Invalid Photo ID' }),
});

export type ProcessPhotoInput = z.infer<typeof processPhotoSchema>;
export type RetryPhotoInput = z.infer<typeof retryPhotoSchema>;

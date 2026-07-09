import { z } from 'zod';

export const selfieUploadSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  image: z.string().min(1, 'Selfie image data is required'),
});

export type SelfieUploadInput = z.infer<typeof selfieUploadSchema>;

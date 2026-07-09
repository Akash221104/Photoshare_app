// schemas/event.schema.ts
// Zod form validation schemas for event actions.

import { z } from 'zod';

export const createEventSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Event name must be at least 3 characters' })
    .max(100, { message: 'Event name must not exceed 100 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description must not exceed 500 characters' })
    .nullable()
    .optional(),
  upload_mode: z.enum(['ALL', 'HOST_ONLY']),
});

export const updateEventSchema = createEventSchema;

export const joinEventSchema = z.object({
  joinCode: z
    .string()
    .min(6, { message: 'Join code must be at least 6 characters' })
    .max(10, { message: 'Join code must not exceed 10 characters' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'Join code must be alphanumeric' }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type JoinEventInput = z.infer<typeof joinEventSchema>;

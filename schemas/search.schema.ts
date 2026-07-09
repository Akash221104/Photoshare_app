import { z } from 'zod';

export const personalSearchSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  threshold: z.number().min(0.0).max(1.0).optional().default(0.40),
  limit: z.number().int().min(1).max(100).optional().default(24),
  offset: z.number().int().min(0).optional().default(0),
  sortBy: z.enum(['similarity', 'date', 'photographer']).optional().default('similarity'),
});

export type PersonalSearchInput = z.infer<typeof personalSearchSchema>;

import { z } from 'zod';

export const createJobSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().min(1),
  price: z.coerce.number().optional()
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

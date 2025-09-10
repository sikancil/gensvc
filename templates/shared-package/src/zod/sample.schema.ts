import { z } from 'zod';

export const SharedSampleSchema = z.object({
  id: z.string().uuid(),
  value: z.string(),
});

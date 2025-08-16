import { z } from 'zod';

export const markReadSchema = z.object({
  notificationIds: z.array(z.string()).nonempty('Must specify at least one ID'),
});

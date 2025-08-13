import z from 'zod';

export const getDailyAnalyticsSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
  templateId: z.string().optional(),
  userId: z.string().optional(),
  days: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 30, 365))
    .optional(),
  aggregateBy: z.enum(['day', 'week', 'month']).optional(),
});

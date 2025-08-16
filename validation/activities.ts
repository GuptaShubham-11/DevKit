import { z } from 'zod';

export const getActivitiesSchema = z.object({
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid userId format')
    .optional(),
  templateId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid templateId format')
    .optional(),
  activityType: z
    .enum(['like', 'view', 'share', 'comment', 'bookmark'])
    .optional(),
  days: z
    .string()
    .transform((val) => Math.min(Math.max(parseInt(val) || 30, 1), 365))
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(Math.max(parseInt(val) || 50, 1), 100))
    .optional(),
  offset: z
    .string()
    .transform((val) => Math.max(parseInt(val) || 0, 0))
    .optional(),
  includeAnonymous: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'activityType']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createActivitySchema = z.object({
  templateId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid templateId format'),
  activityType: z.enum(['like', 'view', 'share', 'comment', 'bookmark']),
  activityData: z
    .object({
      duration: z.number().min(0).max(3600).optional(),
      sharedPlatform: z
        .enum([
          'twitter',
          'linkedin',
          'facebook',
          'discord',
          'slack',
          'email',
          'copy',
        ])
        .optional(),
      commentId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
    })
    .optional(),
});

export type GetActivitiesInput = z.infer<typeof getActivitiesSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;

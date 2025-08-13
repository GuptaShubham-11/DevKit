import { z } from 'zod';

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be under 50 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be under 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  description: z.string().max(200, 'Description too long').optional(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color')
    .optional(),
  category: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  parentId: z.string().nullable().optional(),
  icon: z
    .string()
    .max(50, 'Icon name must be less than 50 characters')
    .optional(),
  sortOrder: z
    .number()
    .int('Sort order must be an integer')
    .min(0, 'Sort order must be non-negative')
    .optional(),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color'),
  featuredTemplates: z.array(z.string()).optional(),
  clickCount: z.number().int().default(0),
  templateCount: z.number().int().default(0),

  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const getCategoriesSchema = z.object({
  parentId: z.string().nullable().optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(['name', 'createdAt', 'clickCount', 'templateCount'])
    .default('createdAt')
    .optional(),
  order: z.enum(['asc', 'desc']).default('asc').optional(),
  includeInactive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
});

export type CreateCategory = z.input<typeof createCategorySchema>;
export type UpdateCategory = z.input<typeof updateCategorySchema>;
export type GetCategories = z.input<typeof getCategoriesSchema>;

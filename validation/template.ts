import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(1, 'Template content is required')
    .max(10000, 'Content must be less than 10,000 characters'),
  tags: z.string().array().optional(),
  supportedPackageManagers: z
    .string()
    .array()
    .min(1, 'At least one package manager is required'),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const getTemplatesSchema = z.object({
  packageManagerId: z.string().optional(),
  search: z.string().max(100).optional(),
  category: z.string().optional(),
  creator: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sort: z.enum(['popular', 'recent', 'name', 'downloads']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 20, 100))
    .optional(),
  offset: z
    .string()
    .transform((val) => Math.max(parseInt(val) || 0, 0))
    .optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

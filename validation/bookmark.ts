import { z } from 'zod';

export const createBookmarkSchema = z.object({
  templateId: z.string(),
  collectionId: z.string().optional(),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional(),
  tags: z.array(z.string())
    .max(10, 'Too many tags')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  isPrivate: z.boolean().optional(),
});

export const updateBookmarkSchema = createBookmarkSchema.partial();

export const getBookmarksSchema = z.object({
  collectionId: z.string().optional(),
  tags: z
    .array(z.string())
    .or(z.string().transform((val) => val.split(',')))
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'archived']).optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['recent', 'oldest', 'priority', 'accessed', 'name']).optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 20, 100))
    .optional(),
  offset: z
    .string()
    .transform((val) => Math.max(parseInt(val) || 0, 0))
    .optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color')
    .optional(),
  icon: z.string().max(10).optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

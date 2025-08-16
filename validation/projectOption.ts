import { z } from 'zod';

export const getProjectOptionsSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  packageManager: z.string().min(1, 'Package manager is required'),
});

export const createProjectOptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  optionType: z.string().max(1, 'Option type is required'),
  category: z.array(z.string()).min(1, 'Category is required'),
  packageManager: z.array(z.string()).min(1, 'Package manager is required'),
  tags: z.array(z.string()).min(1, 'Tags are required'),
  command: z.string().max(1000, 'Command too long'),
  icon: z.string().max(10).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int('Sort order must be an integer'),
});

export const updateProjectOptionSchema = createProjectOptionSchema.partial();

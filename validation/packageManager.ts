import { z } from 'zod';

export const getPackageManagersSchema = z.object({
  includeInactive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  platform: z.enum(['windows', 'macos', 'linux', 'all']).optional(),
  sort: z.enum(['name', 'popularity', 'usage', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 20, 50))
    .optional(),
  search: z.string().max(100).optional(),
});

export const createPackageManagerSchema = z.object({
  name: z
    .string()
    .min(1, 'Package manager name is required')
    .max(50, 'Name too long')
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      'Name can only contain lowercase letters, numbers, and hyphens'
    ),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  installCmd: z
    .string()
    .min(1, 'Install command is required')
    .max(200, 'Install command too long'),
  addPackageCmd: z
    .string()
    .min(1, 'Add package command is required')
    .max(200, 'Add package command too long'),
  devCmd: z.string().max(200, 'Dev command too long').optional(),
  buildCmd: z.string().max(200, 'Build command too long').optional(),
  icon: z
    .string()
    .min(1, 'Icon is required')
    .or(z.string().url('Icon must be a URL')),
  documentationUrl: z.string().url('Invalid documentation URL').optional(),
  homepageUrl: z.string().url('Invalid homepage URL').optional(),
  supportedPlatforms: z
    .array(z.enum(['windows', 'macos', 'linux', 'all']))
    .default(['all']),
  features: z.array(z.string().max(100)).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updatePackageManagerSchema = createPackageManagerSchema.partial();

// Generate command validation
export const generateCommandSchema = z.object({
  packageManagerId: z.string(),
  templateName: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid template name format'),
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid project name format'),
  additionalOptions: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

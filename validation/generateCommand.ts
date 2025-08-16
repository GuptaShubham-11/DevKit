import { z } from 'zod';

export const generateCommandSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name required')
    .max(100, 'Project name too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid project name characters'),
  projectCategory: z.string().max(1, 'Project category required'),
  packageManagerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid package manager ID'),
  selectedOptionIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid option ID'))
    .default([]),
  customOptions: z
    .array(z.string().max(200, 'Custom option too long'))
    .max(10, 'Too many custom options')
    .default([]),
});

export type GenerateCommandInput = z.infer<typeof generateCommandSchema>;

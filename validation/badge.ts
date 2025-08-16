import { z } from 'zod';

export const getBadgesSchema = z.object({
  category: z
    .enum([
      'creator',
      'community',
      'usage',
      'milestone',
      'special',
      'seasonal',
      'achievement',
    ])
    .optional(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  userId: z.string().optional(),
  includeProgress: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  includeInactive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 50, 100))
    .optional(),
  offset: z
    .string()
    .transform((val) => Math.max(parseInt(val) || 0, 0))
    .optional(),
  sort: z.enum(['rarity', 'category', 'createdAt', 'name']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const createBadgeSchema = z.object({
  name: z
    .string()
    .min(1, 'Badge name is required')
    .max(100, 'Badge name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  badgeImage: z
    .string()
    .min(1, 'Badge image is required')
    .url('Badge image must be a valid URL')
    .or(
      z
        .string()
        .regex(/^\/badges\/.*\.(png|jpg|jpeg|svg)$/, 'Invalid badge image path')
    ),
  criteria: z
    .object({
      type: z.enum([
        'templatesCreated',
        'copiesReceived',
        'commandsGenerated',
        'likesReceived',
        'communityHelper'
      ]),
      condition: z.enum(['gte', 'lte', 'eq', 'between']),
      value: z.number().min(1),
      timeframe: z
        .enum(['allTime', '30Days', '7Days', '1Day'])
        .default('allTime'),
      additionalConditions: z.record(z.string(), z.any()).optional(),
    })
    .refine(
      (data) => {
        if (
          data.condition === 'between' &&
          (!Array.isArray(data.value) || data.value.length !== 2)
        )
          return false;
        return true;
      },
      { message: 'Between must have two values' }
    ),
  pointsRequired: z
    .number()
    .min(0, 'Points required cannot be negative')
    .max(10000, 'Points required too high')
    .optional(),
  isActive: z.boolean().default(true),
  rarityLevel: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  rewardData: z
    .object({
      xpBonus: z
        .number()
        .min(0, 'XP bonus cannot be negative')
        .max(5000, 'XP bonus too high')
        .optional(),
      profileBadge: z.boolean().optional(),
      specialPrivileges: z.array(z.string().min(1)).optional(),
    })
    .optional(),
  category: z
    .enum([
      'creator',
      'community',
      'usage',
      'milestone',
      'special',
      'seasonal',
      'achievement',
    ])
    .optional(),
});

export const updateBadgeSchema = createBadgeSchema.partial();

export const checkBadgeProgressSchema = z.object({
  userId: z.string(),
  badgeId: z.string().optional(),
});

export const awardBadgeSchema = z.object({
  userId: z.string(),
  badgeId: z.string(),
  reason: z
    .string()
    .min(1, 'Reason is required')
    .max(200, 'Reason too long')
    .optional(),
  overrideCriteria: z.boolean().optional(), // Allow admin to override eligibility
});

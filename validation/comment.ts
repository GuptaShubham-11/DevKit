import z from 'zod';

export const getCommentsSchema = z.object({
  templateId: z.string(),
  limit: z
    .string()
    .transform((val) => Math.min(parseInt(val) || 50, 200))
    .optional(),
  offset: z
    .string()
    .transform((val) => Math.max(parseInt(val) || 0, 0))
    .optional(),
});

export const createCommentSchema = z.object({
  commentText: z
    .string()
    .min(1, 'Comment text is required')
    .max(500, 'Comment text must be under 500 characters'),
  templateId: z.string(),
});

export const updateCommentSchema = createCommentSchema.partial();

export const deleteCommentSchema = z.object({
  commentId: z.string(),
});

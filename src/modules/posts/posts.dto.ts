import { z } from 'zod';
import { PostStatus } from '../../domain/entities/Post';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  status: z.nativeEnum(PostStatus).optional().default(PostStatus.DRAFT),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(PostStatus).optional(),
});

export const postQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  status: z.nativeEnum(PostStatus).optional(),
  categoryId: z.string().optional(),
  tags: z.string().transform((str) => str.split(',')).optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type PostQueryDto = z.infer<typeof postQuerySchema>;

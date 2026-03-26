import { z } from 'zod';

export const createCommentSchema = z.object({
  
    content: z.string().min(1, 'Content is required').max(1000, 'Comment too long'),
    postId: z.string().min(1, 'Post ID is required'),
 
});

export const updateCommentSchema = z.object({
  
    content: z.string().min(1, 'Content is required').max(1000, 'Comment too long'),
  
});

export const commentQuerySchema = z.object({
  
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  
});

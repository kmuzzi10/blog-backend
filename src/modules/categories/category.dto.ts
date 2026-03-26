import { z } from 'zod';

export const createCategorySchema = z.object({
  
    name: z.string().min(1, 'Category name is required').max(100),
    description: z.string().max(500).optional(),
  
});

export const categoryQuerySchema = z.object({
  
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
  
});

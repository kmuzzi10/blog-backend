import { z } from 'zod';
import { PostStatus } from '../../domain/entities/Post';
export declare const createPostSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodNativeEnum<typeof PostStatus>>>;
}, "strip", z.ZodTypeAny, {
    status: PostStatus;
    title: string;
    content: string;
    tags: string[];
    excerpt?: string | undefined;
    categoryId?: string | undefined;
}, {
    title: string;
    content: string;
    status?: PostStatus | undefined;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const updatePostSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PostStatus>>;
}, "strip", z.ZodTypeAny, {
    status?: PostStatus | undefined;
    title?: string | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}, {
    status?: PostStatus | undefined;
    title?: string | undefined;
    content?: string | undefined;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const postQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PostStatus>>;
    categoryId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodEffects<z.ZodString, string[], string>>;
    authorId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    status?: PostStatus | undefined;
    search?: string | undefined;
    authorId?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
    status?: PostStatus | undefined;
    search?: string | undefined;
    authorId?: string | undefined;
    categoryId?: string | undefined;
    tags?: string | undefined;
}>;
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type PostQueryDto = z.infer<typeof postQuerySchema>;
//# sourceMappingURL=posts.dto.d.ts.map
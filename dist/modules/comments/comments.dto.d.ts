import { z } from 'zod';
export declare const createCommentSchema: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
}, {
    content: string;
    postId: string;
}>;
export declare const updateCommentSchema: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export declare const commentQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    limit: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
//# sourceMappingURL=comments.dto.d.ts.map
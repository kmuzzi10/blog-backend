import { z } from 'zod';
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const categoryQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    limit: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
    search?: string | undefined;
}>;
//# sourceMappingURL=category.dto.d.ts.map
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Zod validation middleware factory.
 * Validates req.body against the provided Zod schema.
 */
export declare const validate: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validates query parameters against a Zod schema.
 */
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map
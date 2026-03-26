import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

/**
 * Zod validation middleware factory.
 * Validates req.body against the provided Zod schema.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
      return;
    }
    req.body = result.data;
    next();
  };

/**
 * Validates query parameters against a Zod schema.
 */
export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'Invalid query parameters', 400, 'VALIDATION_ERROR', errors);
      return;
    }
    req.query = result.data as Record<string, string>;
    next();
  };

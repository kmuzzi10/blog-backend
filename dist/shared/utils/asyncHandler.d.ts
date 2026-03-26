import { Request, Response, NextFunction, RequestHandler } from 'express';
/**
 * Wraps async route handlers to automatically forward errors to Express error middleware.
 * Eliminates the need for try-catch in every controller.
 */
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => RequestHandler;
//# sourceMappingURL=asyncHandler.d.ts.map
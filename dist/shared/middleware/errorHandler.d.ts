import { Request, Response, NextFunction } from 'express';
/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 handler for unmatched routes.
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
//# sourceMappingURL=errorHandler.d.ts.map
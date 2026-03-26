import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      req: {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
    },
    'Request error',
  );

  // Operational errors (our custom AppError)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  // Zod validation errors (from Zod .parse() calls not caught by middleware)
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
    return;
  }

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const mongoError = err as mongoose.mongo.MongoServerError;
    const field = Object.keys(mongoError.keyValue || {})[0];
    sendError(
      res,
      `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`,
      409,
      'CONFLICT',
    );
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');
    return;
  }

  // Default: unknown / programming error
  sendError(res, 'An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR');
};

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.url} not found`, 404, 'NOT_FOUND');
};

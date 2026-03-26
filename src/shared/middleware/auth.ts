import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { UserRole } from '../../domain/entities/User';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Authentication failed');
  }
};

/**
 * Optionally authenticate — does not throw if no token is present.
 * Useful for public endpoints that can show extra data when authenticated.
 */
export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

/**
 * Role-based authorization middleware factory.
 * Must be used AFTER authenticate middleware.
 */
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role(s): ${roles.join(', ')}`,
      );
    }
    next();
  };

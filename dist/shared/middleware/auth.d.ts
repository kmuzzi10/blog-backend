import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../domain/entities/User';
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
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
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Optionally authenticate — does not throw if no token is present.
 * Useful for public endpoints that can show extra data when authenticated.
 */
export declare const optionalAuthenticate: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Role-based authorization middleware factory.
 * Must be used AFTER authenticate middleware.
 */
export declare const authorize: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const AppError_1 = require("../utils/AppError");
/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded payload to req.user.
 */
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError_1.UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new AppError_1.UnauthorizedError('Token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new AppError_1.UnauthorizedError('Invalid token');
        }
        throw new AppError_1.UnauthorizedError('Authentication failed');
    }
};
exports.authenticate = authenticate;
/**
 * Optionally authenticate — does not throw if no token is present.
 * Useful for public endpoints that can show extra data when authenticated.
 */
const optionalAuthenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = decoded;
    }
    catch {
        // Silently ignore invalid tokens for optional auth
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
/**
 * Role-based authorization middleware factory.
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) {
        throw new AppError_1.UnauthorizedError('Not authenticated');
    }
    if (!roles.includes(req.user.role)) {
        throw new AppError_1.ForbiddenError(`Access denied. Required role(s): ${roles.join(', ')}`);
    }
    next();
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map
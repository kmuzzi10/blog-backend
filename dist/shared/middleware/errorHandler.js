"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../utils/AppError");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
/**
 * Centralized error handling middleware.
 * Must be registered LAST in Express middleware chain.
 */
const errorHandler = (err, req, res, _next) => {
    logger_1.logger.error({
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
    }, 'Request error');
    // Operational errors (our custom AppError)
    if (err instanceof AppError_1.AppError) {
        (0, apiResponse_1.sendError)(res, err.message, err.statusCode, err.code);
        return;
    }
    // Zod validation errors (from Zod .parse() calls not caught by middleware)
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        (0, apiResponse_1.sendError)(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
        return;
    }
    // Mongoose duplicate key error
    if (err.code === '11000') {
        const mongoError = err;
        const field = Object.keys(mongoError.keyValue || {})[0];
        (0, apiResponse_1.sendError)(res, `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`, 409, 'CONFLICT');
        return;
    }
    // Mongoose validation error
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        (0, apiResponse_1.sendError)(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
        return;
    }
    // Mongoose CastError (invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        (0, apiResponse_1.sendError)(res, `Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');
        return;
    }
    // Default: unknown / programming error
    (0, apiResponse_1.sendError)(res, 'An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR');
};
exports.errorHandler = errorHandler;
/**
 * 404 handler for unmatched routes.
 */
const notFoundHandler = (req, res) => {
    (0, apiResponse_1.sendError)(res, `Route ${req.method} ${req.url} not found`, 404, 'NOT_FOUND');
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map
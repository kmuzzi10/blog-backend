"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validate = void 0;
const apiResponse_1 = require("../utils/apiResponse");
/**
 * Zod validation middleware factory.
 * Validates req.body against the provided Zod schema.
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        (0, apiResponse_1.sendError)(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
        return;
    }
    req.body = result.data;
    next();
};
exports.validate = validate;
/**
 * Validates query parameters against a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        (0, apiResponse_1.sendError)(res, 'Invalid query parameters', 400, 'VALIDATION_ERROR', errors);
        return;
    }
    req.query = result.data;
    next();
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validate.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryQuerySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(100),
    description: zod_1.z.string().max(500).optional(),
});
exports.categoryQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=category.dto.js.map
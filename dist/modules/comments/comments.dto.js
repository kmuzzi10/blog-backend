"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentQuerySchema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required').max(1000, 'Comment too long'),
    postId: zod_1.z.string().min(1, 'Post ID is required'),
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Content is required').max(1000, 'Comment too long'),
});
exports.commentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
//# sourceMappingURL=comments.dto.js.map
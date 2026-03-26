"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postQuerySchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
const Post_1 = require("../../domain/entities/Post");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    content: zod_1.z.string().min(1, 'Content is required'),
    excerpt: zod_1.z.string().max(500).optional(),
    categoryId: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    status: zod_1.z.nativeEnum(Post_1.PostStatus).optional().default(Post_1.PostStatus.DRAFT),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    content: zod_1.z.string().min(1).optional(),
    excerpt: zod_1.z.string().max(500).optional(),
    categoryId: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.nativeEnum(Post_1.PostStatus).optional(),
});
exports.postQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
    status: zod_1.z.nativeEnum(Post_1.PostStatus).optional(),
    categoryId: zod_1.z.string().optional(),
    tags: zod_1.z.string().transform((str) => str.split(',')).optional(),
    authorId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=posts.dto.js.map
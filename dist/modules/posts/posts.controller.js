"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class PostController {
    constructor(postService) {
        this.postService = postService;
        this.createPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            // ensure tags are parsed back to array if came as string from FormData
            if (typeof req.body.tags === 'string') {
                try {
                    req.body.tags = JSON.parse(req.body.tags);
                }
                catch {
                    req.body.tags = req.body.tags.split(',').map((t) => t.trim());
                }
            }
            const post = await this.postService.createPost(userId, req.body, req.file);
            (0, apiResponse_1.sendSuccess)(res, post, 'Post created successfully', 201);
        });
        this.getPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // If admin is requesting, they probably want all posts regardless of status
            // Unless status is explicitly provided
            if (req.user?.role === 'admin' && !req.query.status) {
                const { posts, total } = await this.postService.getPosts(req.query);
                (0, apiResponse_1.sendPaginated)(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'Posts retrieved');
                return;
            }
            // Default: only published posts for public access
            const { posts, total } = await this.postService.getPublishedPosts(req.query);
            (0, apiResponse_1.sendPaginated)(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'Published posts retrieved');
        });
        this.getMyPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const query = { ...req.query, authorId: userId };
            const { posts, total } = await this.postService.getPosts(query);
            (0, apiResponse_1.sendPaginated)(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'My posts retrieved');
        });
        this.getPostBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { slug } = req.params;
            const post = await this.postService.getPostBySlug(slug);
            (0, apiResponse_1.sendSuccess)(res, post, 'Post retrieved');
        });
        this.getPostById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const post = await this.postService.getPostById(id);
            (0, apiResponse_1.sendSuccess)(res, post, 'Post retrieved');
        });
        this.updatePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            // Parse tags similarly to create
            if (typeof req.body.tags === 'string') {
                try {
                    req.body.tags = JSON.parse(req.body.tags);
                }
                catch {
                    req.body.tags = req.body.tags.split(',').map((t) => t.trim());
                }
            }
            const post = await this.postService.updatePost(userId, userRole, id, req.body, req.file);
            (0, apiResponse_1.sendSuccess)(res, post, 'Post updated successfully');
        });
        this.deletePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;
            await this.postService.deletePost(userId, userRole, id);
            (0, apiResponse_1.sendSuccess)(res, null, 'Post deleted successfully');
        });
    }
}
exports.PostController = PostController;
//# sourceMappingURL=posts.controller.js.map
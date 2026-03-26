"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = require("express");
const posts_controller_1 = require("./posts.controller");
const posts_service_1 = require("./posts.service");
const PostRepository_1 = require("../../infrastructure/repositories/PostRepository");
const VercelBlobStorageService_1 = require("../../infrastructure/blobStorage/VercelBlobStorageService");
const validate_1 = require("../../shared/middleware/validate");
const auth_1 = require("../../shared/middleware/auth");
const upload_1 = require("../../shared/middleware/upload");
const posts_dto_1 = require("./posts.dto");
const User_1 = require("../../domain/entities/User");
const rateLimiter_1 = require("../../shared/middleware/rateLimiter");
const router = (0, express_1.Router)();
// Dependency Injection
const postRepository = new PostRepository_1.PostRepository();
const blobStorageService = new VercelBlobStorageService_1.VercelBlobStorageService();
const postService = new posts_service_1.PostService(postRepository, blobStorageService);
const postController = new posts_controller_1.PostController(postService);
// Public Routes
router.get('/', rateLimiter_1.searchLimiter, auth_1.optionalAuthenticate, (0, validate_1.validateQuery)(posts_dto_1.postQuerySchema), postController.getPosts);
router.get('/slug/:slug', auth_1.optionalAuthenticate, postController.getPostBySlug);
router.get('/id/:id', auth_1.optionalAuthenticate, postController.getPostById);
// Protected Routes (Authors and Admins)
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(User_1.UserRole.AUTHOR, User_1.UserRole.ADMIN));
router.get('/me', (0, validate_1.validateQuery)(posts_dto_1.postQuerySchema), postController.getMyPosts);
// Content Creation / Update
router.post('/', rateLimiter_1.contentLimiter, (0, upload_1.uploadSingle)('featuredImage'), postController.createPost);
router.put('/:id', rateLimiter_1.contentLimiter, (0, upload_1.uploadSingle)('featuredImage'), postController.updatePost);
router.delete('/:id', postController.deletePost);
exports.postRoutes = router;
//# sourceMappingURL=posts.routes.js.map
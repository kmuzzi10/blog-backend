"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = void 0;
const express_1 = require("express");
const comments_controller_1 = require("./comments.controller");
const comments_service_1 = require("./comments.service");
const CommentRepository_1 = require("../../infrastructure/repositories/CommentRepository");
const auth_1 = require("../../shared/middleware/auth");
const validate_1 = require("../../shared/middleware/validate");
const comments_dto_1 = require("./comments.dto");
const rateLimiter_1 = require("../../shared/middleware/rateLimiter");
const router = (0, express_1.Router)();
// Dependency Injection
const commentRepository = new CommentRepository_1.CommentRepository();
const commentService = new comments_service_1.CommentService(commentRepository);
const commentController = new comments_controller_1.CommentController(commentService);
// 1. PUBLIC ROUTE: Anyone can read comments on a post
router.get('/post/:postId', (0, validate_1.validateQuery)(comments_dto_1.commentQuerySchema), commentController.getCommentsByPostId);
// 2. PROTECTED ROUTES: Any authenticated user (Authors, Admins)
router.use(auth_1.authenticate);
// Create a comment (Protected by rate limiter against spam)
router.post('/', rateLimiter_1.contentLimiter, (0, validate_1.validate)(comments_dto_1.createCommentSchema), commentController.createComment);
// Edit a comment (enforced ownership inside Service)
router.put('/:id', (0, validate_1.validate)(comments_dto_1.updateCommentSchema), commentController.updateComment);
// Delete a comment (enforced ownership inside Service)
router.delete('/:id', commentController.deleteComment);
exports.commentRoutes = router;
//# sourceMappingURL=comments.routes.js.map
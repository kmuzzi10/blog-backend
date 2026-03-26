import { Router } from 'express';
import { CommentController } from './comments.controller';
import { CommentService } from './comments.service';
import { CommentRepository } from '../../infrastructure/repositories/CommentRepository';
import { authenticate } from '../../shared/middleware/auth';
import { validate, validateQuery } from '../../shared/middleware/validate';
import { createCommentSchema, updateCommentSchema, commentQuerySchema } from './comments.dto';
import { contentLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// Dependency Injection
const commentRepository = new CommentRepository();
const commentService = new CommentService(commentRepository);
const commentController = new CommentController(commentService);

// 1. PUBLIC ROUTE: Anyone can read comments on a post
router.get('/post/:postId', validateQuery(commentQuerySchema), commentController.getCommentsByPostId);

// 2. PROTECTED ROUTES: Any authenticated user (Authors, Admins)
router.use(authenticate);

// Create a comment (Protected by rate limiter against spam)
router.post('/', contentLimiter, validate(createCommentSchema), commentController.createComment);

// Edit a comment (enforced ownership inside Service)
router.put('/:id', validate(updateCommentSchema), commentController.updateComment);

// Delete a comment (enforced ownership inside Service)
router.delete('/:id', commentController.deleteComment);

export const commentRoutes = router;

import { Router } from 'express';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { PostRepository } from '../../infrastructure/repositories/PostRepository';
import { VercelBlobStorageService } from '../../infrastructure/blobStorage/VercelBlobStorageService';
import { validateQuery } from '../../shared/middleware/validate';
import { authenticate, optionalAuthenticate, authorize } from '../../shared/middleware/auth';
import { uploadSingle } from '../../shared/middleware/upload';
import { postQuerySchema } from './posts.dto';
import { UserRole } from '../../domain/entities/User';
import { contentLimiter, searchLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// Dependency Injection
const postRepository = new PostRepository();
const blobStorageService = new VercelBlobStorageService();
const postService = new PostService(postRepository, blobStorageService);
const postController = new PostController(postService);

// Public Routes
router.get('/', searchLimiter, optionalAuthenticate, validateQuery(postQuerySchema), postController.getPosts);
router.get('/slug/:slug', optionalAuthenticate, postController.getPostBySlug);
router.get('/id/:id', optionalAuthenticate, postController.getPostById);

// Protected Routes (Authors and Admins)
router.use(authenticate);
router.use(authorize(UserRole.AUTHOR, UserRole.ADMIN));

router.get('/me', validateQuery(postQuerySchema), postController.getMyPosts);

// Content Creation / Update
router.post('/', contentLimiter, uploadSingle('featuredImage'), postController.createPost);
router.put('/:id', contentLimiter, uploadSingle('featuredImage'), postController.updatePost);
router.delete('/:id', postController.deletePost);

export const postRoutes = router;

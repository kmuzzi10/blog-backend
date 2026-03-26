import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { uploadSingle } from '../../shared/middleware/upload';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.dto';
import { z } from 'zod';
import { VercelBlobStorageService } from '../../infrastructure/blobStorage/VercelBlobStorageService';
import { authLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// Dependency Injection
const userRepository = new UserRepository();
const blobStorageService = new VercelBlobStorageService();
const authService = new AuthService(userRepository, blobStorageService);
const authController = new AuthController(authService);

router.post('/register', authLimiter, uploadSingle('avatar'), validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post(
  '/change-password',
  validate(changePasswordSchema),
  authController.changePassword,
);

export const authRoutes = router;

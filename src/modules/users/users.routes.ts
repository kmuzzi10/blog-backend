import { Router } from 'express';
import { UserController } from './users.controller';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { VercelBlobStorageService } from '../../infrastructure/blobStorage/VercelBlobStorageService';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { uploadSingle } from '../../shared/middleware/upload';
import { UserRole } from '../../domain/entities/User';

const router = Router();

const userRepository = new UserRepository();
const blobStorageService = new VercelBlobStorageService();
const userController = new UserController(userRepository, blobStorageService);

router.use(authenticate);

// Author specific dashboard
router.get('/dashboard/author', userController.getAuthorDashboard);

// Update own profile
router.patch('/profile', uploadSingle('avatar'), userController.updateProfile);

// Only admins can manage users
router.use(authorize(UserRole.ADMIN));

router.get('/dashboard/admin', userController.getAdminDashboard);
router.patch('/:id/disable', userController.disableUser);
router.patch('/:id/enable', userController.enableUser);
router.delete('/:id/moderate', userController.deleteUserModerate);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export const userRoutes = router;

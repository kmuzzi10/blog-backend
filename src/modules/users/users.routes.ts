import { Router } from 'express';
import { UserController } from './users.controller';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { UserRole } from '../../domain/entities/User';

const router = Router();

const userRepository = new UserRepository();
const userController = new UserController(userRepository);

router.use(authenticate);

// Only admins can manage users (for simplicity)
router.use(authorize(UserRole.ADMIN));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export const userRoutes = router;

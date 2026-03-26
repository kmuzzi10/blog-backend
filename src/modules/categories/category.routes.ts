import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { authenticate, authorize } from '../../shared/middleware/auth';
import { validate, validateQuery } from '../../shared/middleware/validate';
import { createCategorySchema, categoryQuerySchema } from './category.dto';
import { UserRole } from '../../domain/entities/User';

const router = Router();

// Dependency Injection
const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

// 1. PUBLIC ROUTE: Anyone can get categories, pagination applied
router.get('/', validateQuery(categoryQuerySchema), categoryController.getCategories);

// 2. PROTECTED ROUTES: Only accessible by logged-in ADMIN users
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.delete('/:id', categoryController.deleteCategory);

export const categoryRoutes = router;

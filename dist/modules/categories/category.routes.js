"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = void 0;
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const category_service_1 = require("./category.service");
const CategoryRepository_1 = require("../../infrastructure/repositories/CategoryRepository");
const auth_1 = require("../../shared/middleware/auth");
const validate_1 = require("../../shared/middleware/validate");
const category_dto_1 = require("./category.dto");
const User_1 = require("../../domain/entities/User");
const router = (0, express_1.Router)();
// Dependency Injection
const categoryRepository = new CategoryRepository_1.CategoryRepository();
const categoryService = new category_service_1.CategoryService(categoryRepository);
const categoryController = new category_controller_1.CategoryController(categoryService);
// 1. PUBLIC ROUTE: Anyone can get categories, pagination applied
router.get('/', (0, validate_1.validateQuery)(category_dto_1.categoryQuerySchema), categoryController.getCategories);
// 2. PROTECTED ROUTES: Only accessible by logged-in ADMIN users
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)(User_1.UserRole.ADMIN));
router.post('/', (0, validate_1.validate)(category_dto_1.createCategorySchema), categoryController.createCategory);
router.delete('/:id', categoryController.deleteCategory);
exports.categoryRoutes = router;
//# sourceMappingURL=category.routes.js.map
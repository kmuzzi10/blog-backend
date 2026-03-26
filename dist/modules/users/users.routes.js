"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const UserRepository_1 = require("../../infrastructure/repositories/UserRepository");
const VercelBlobStorageService_1 = require("../../infrastructure/blobStorage/VercelBlobStorageService");
const auth_1 = require("../../shared/middleware/auth");
const upload_1 = require("../../shared/middleware/upload");
const User_1 = require("../../domain/entities/User");
const router = (0, express_1.Router)();
const userRepository = new UserRepository_1.UserRepository();
const blobStorageService = new VercelBlobStorageService_1.VercelBlobStorageService();
const userController = new users_controller_1.UserController(userRepository, blobStorageService);
router.use(auth_1.authenticate);
// Author specific dashboard
router.get('/dashboard/author', userController.getAuthorDashboard);
// Update own profile
router.patch('/profile', (0, upload_1.uploadSingle)('avatar'), userController.updateProfile);
// Only admins can manage users
router.use((0, auth_1.authorize)(User_1.UserRole.ADMIN));
router.get('/dashboard/admin', userController.getAdminDashboard);
router.patch('/:id/disable', userController.disableUser);
router.patch('/:id/enable', userController.enableUser);
router.delete('/:id/moderate', userController.deleteUserModerate);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
exports.userRoutes = router;
//# sourceMappingURL=users.routes.js.map
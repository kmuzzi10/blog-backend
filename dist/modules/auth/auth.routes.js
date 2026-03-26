"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const UserRepository_1 = require("../../infrastructure/repositories/UserRepository");
const validate_1 = require("../../shared/middleware/validate");
const auth_1 = require("../../shared/middleware/auth");
const upload_1 = require("../../shared/middleware/upload");
const auth_dto_1 = require("./auth.dto");
const zod_1 = require("zod");
const VercelBlobStorageService_1 = require("../../infrastructure/blobStorage/VercelBlobStorageService");
const rateLimiter_1 = require("../../shared/middleware/rateLimiter");
const router = (0, express_1.Router)();
// Dependency Injection
const userRepository = new UserRepository_1.UserRepository();
const blobStorageService = new VercelBlobStorageService_1.VercelBlobStorageService();
const authService = new auth_service_1.AuthService(userRepository, blobStorageService);
const authController = new auth_controller_1.AuthController(authService);
router.post('/register', rateLimiter_1.authLimiter, (0, upload_1.uploadSingle)('avatar'), (0, validate_1.validate)(auth_dto_1.registerSchema), authController.register);
router.post('/login', rateLimiter_1.authLimiter, (0, validate_1.validate)(auth_dto_1.loginSchema), authController.login);
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
router.post('/refresh-token', (0, validate_1.validate)(refreshTokenSchema), authController.refreshToken);
// Protected routes
router.use(auth_1.authenticate);
router.get('/me', authController.getMe);
router.post('/change-password', (0, validate_1.validate)(auth_dto_1.changePasswordSchema), authController.changePassword);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map
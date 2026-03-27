"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.authService.register(req.body, req.file);
            (0, apiResponse_1.sendSuccess)(res, result, 'Registration successful', 201);
        });
        this.registerAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.authService.registerAdmin(req.body);
            (0, apiResponse_1.sendSuccess)(res, result, 'Admin account created successfully', 201);
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this.authService.login(req.body);
            (0, apiResponse_1.sendSuccess)(res, result, 'Login successful');
        });
        this.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshAccessToken(refreshToken);
            (0, apiResponse_1.sendSuccess)(res, result, 'Token refreshed');
        });
        this.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            await this.authService.changePassword(req.user.userId, req.body);
            (0, apiResponse_1.sendSuccess)(res, null, 'Password changed successfully');
        });
        this.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this.authService.getMe(req.user.userId);
            (0, apiResponse_1.sendSuccess)(res, user, 'Profile retrieved');
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
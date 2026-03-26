"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const apiResponse_1 = require("../../shared/utils/apiResponse");
const User_1 = require("../../domain/entities/User");
class UserController {
    constructor(userRepository, blobStorageService) {
        this.userRepository = userRepository;
        this.blobStorageService = blobStorageService;
        this.getAuthorDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const dashboardData = await this.userRepository.getAuthorDashboard(userId);
            (0, apiResponse_1.sendSuccess)(res, dashboardData, 'Author dashboard data retrieved successfully');
        });
        this.getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const role = req.query.role;
            const search = req.query.search;
            const { users, total } = await this.userRepository.findAll({ page, limit, role, search });
            return (0, apiResponse_1.sendPaginated)(res, users, total, page, limit, 'Users retrieved successfully');
        });
        this.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = await this.userRepository.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return (0, apiResponse_1.sendSuccess)(res, user, 'User retrieved successfully');
        });
        this.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updatedUser = await this.userRepository.update(id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return (0, apiResponse_1.sendSuccess)(res, updatedUser, 'User updated successfully');
        });
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const deleted = await this.userRepository.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            return (0, apiResponse_1.sendSuccess)(res, null, 'User deleted successfully');
        });
        this.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const existingUser = await this.userRepository.findById(userId);
            if (!existingUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            const updateData = { ...req.body };
            // Handle avatar upload if file is present
            if (req.file && this.blobStorageService) {
                const uploadResult = await this.blobStorageService.upload(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
                // Optionally delete old avatar from blob storage if it exists
                if (existingUser.avatar) {
                    this.blobStorageService.delete(existingUser.avatar).catch(() => { });
                }
                updateData.avatar = uploadResult.url;
            }
            const updatedUser = await this.userRepository.update(userId, updateData);
            const { password: _, ...userPublic } = updatedUser;
            return (0, apiResponse_1.sendSuccess)(res, userPublic, 'Profile updated successfully');
        });
        this.getAdminDashboard = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const dashboardData = await this.userRepository.getAdminDashboard();
            return (0, apiResponse_1.sendSuccess)(res, dashboardData, 'Admin dashboard data retrieved successfully');
        });
        this.disableUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.userRepository.moderateStatus(id, User_1.UserStatus.DISABLED);
            return (0, apiResponse_1.sendSuccess)(res, null, 'User has been disabled successfully');
        });
        this.enableUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.userRepository.moderateStatus(id, User_1.UserStatus.ACTIVE);
            return (0, apiResponse_1.sendSuccess)(res, null, 'User has been re-enabled successfully');
        });
        this.deleteUserModerate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.userRepository.moderateStatus(id, User_1.UserStatus.DELETED);
            return (0, apiResponse_1.sendSuccess)(res, null, 'User and all their content have been deleted by admin');
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=users.controller.js.map
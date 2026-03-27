"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../domain/entities/User");
const AppError_1 = require("../../shared/utils/AppError");
const config_1 = require("../../shared/config/config");
class AuthService {
    constructor(userRepository, blobStorageService) {
        this.userRepository = userRepository;
        this.blobStorageService = blobStorageService;
    }
    async register(dto, file) {
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new AppError_1.ConflictError('Email already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, config_1.config.bcryptSaltRounds);
        let avatarUrl = undefined;
        if (file) {
            const uploadResult = await this.blobStorageService.upload(file.buffer, file.originalname, file.mimetype, 'avatars');
            avatarUrl = uploadResult.url;
        }
        const user = await this.userRepository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: User_1.UserRole.AUTHOR,
            status: User_1.UserStatus.ACTIVE,
            bio: dto.bio,
            avatar: avatarUrl,
        });
        const tokens = this.generateTokens(user);
        const userPublic = this.toPublicUser(user);
        return { user: userPublic, tokens };
    }
    async registerAdmin(dto) {
        const adminSecret = process.env.ADMIN_REGISTRATION_SECRET || 'super-secret-admin-key-123';
        if (dto.adminSecret !== adminSecret) {
            throw new AppError_1.UnauthorizedError('Invalid admin registration secret');
        }
        const existing = await this.userRepository.findByEmail(dto.email);
        if (existing) {
            throw new AppError_1.ConflictError('Email already registered');
        }
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, config_1.config.bcryptSaltRounds);
        const user = await this.userRepository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: User_1.UserRole.ADMIN,
            status: User_1.UserStatus.ACTIVE,
            bio: dto.bio || 'Platform Administrator',
        });
        const tokens = this.generateTokens(user);
        const userPublic = this.toPublicUser(user);
        return { user: userPublic, tokens };
    }
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        if (user.status === User_1.UserStatus.DISABLED) {
            throw new AppError_1.UnauthorizedError('Your account has been disabled. You cannot open your account at this moment.');
        }
        if (user.status === User_1.UserStatus.DELETED) {
            throw new AppError_1.UnauthorizedError('Your account has been deleted by an administrator. Access is permanently revoked.');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        }
        const tokens = this.generateTokens(user);
        const userPublic = this.toPublicUser(user);
        return { user: userPublic, tokens };
    }
    async changePassword(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError_1.NotFoundError('User not found');
        }
        const isValid = await bcryptjs_1.default.compare(dto.currentPassword, user.password);
        if (!isValid) {
            throw new AppError_1.UnauthorizedError('Current password is incorrect');
        }
        const hashedPassword = await bcryptjs_1.default.hash(dto.newPassword, config_1.config.bcryptSaltRounds);
        await this.userRepository.update(userId, { password: hashedPassword });
    }
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwtRefreshSecret);
            const user = await this.userRepository.findById(decoded.userId);
            if (!user || user.status !== User_1.UserStatus.ACTIVE) {
                throw new AppError_1.UnauthorizedError('Invalid refresh token');
            }
            const accessToken = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, role: user.role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
            return { accessToken };
        }
        catch {
            throw new AppError_1.UnauthorizedError('Invalid or expired refresh token');
        }
    }
    async getMe(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user)
            throw new AppError_1.NotFoundError('User not found');
        return this.toPublicUser(user);
    }
    generateTokens(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
            expiresIn: config_1.config.jwtExpiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtRefreshSecret, {
            expiresIn: config_1.config.jwtRefreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }
    toPublicUser(user) {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
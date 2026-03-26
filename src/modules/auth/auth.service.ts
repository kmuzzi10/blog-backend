import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IUser, IUserPublic, UserRole } from '../../domain/entities/User';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/utils/AppError';
import { config } from '../../shared/config/config';
import { JwtPayload } from '../../shared/middleware/auth';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: IUserPublic;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, config.bcryptSaltRounds);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.AUTHOR,
      isActive: true,
    });

    const tokens = this.generateTokens(user);
    const userPublic = this.toPublicUser(user);

    return { user: userPublic, tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);
    const userPublic = this.toPublicUser(user);

    return { user: userPublic, tokens };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, config.bcryptSaltRounds);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as JwtPayload;
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = jwt.sign(
        { userId: user._id!.toString(), email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string): Promise<IUserPublic> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return this.toPublicUser(user);
  }

  private generateTokens(user: IUser): AuthTokens {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });

    const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: IUser): IUserPublic {
    return {
      _id: user._id!.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isActive: user.isActive,
      createdAt: user.createdAt!,
      updatedAt: user.updatedAt!,
    };
  }
}

import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IUserPublic } from '../../domain/entities/User';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    user: IUserPublic;
    tokens: AuthTokens;
}
import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
export declare class AuthService {
    private readonly userRepository;
    private readonly blobStorageService;
    constructor(userRepository: IUserRepository, blobStorageService: IBlobStorageService);
    register(dto: RegisterDto, file?: Express.Multer.File): Promise<AuthResponse>;
    registerAdmin(dto: RegisterDto & {
        adminSecret: string;
    }): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    getMe(userId: string): Promise<IUserPublic>;
    private generateTokens;
    private toPublicUser;
}
//# sourceMappingURL=auth.service.d.ts.map
import { IUser, IUserPublic, UserStatus } from '../entities/User';
export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    findAll(options?: {
        page?: number;
        limit?: number;
        role?: string;
        search?: string;
    }): Promise<{
        users: IUserPublic[];
        total: number;
    }>;
    create(user: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;
    update(id: string, data: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
    countAll(): Promise<number>;
    getAuthorDashboard(userId: string): Promise<any>;
    getAdminDashboard(): Promise<any>;
    moderateStatus(id: string, status: UserStatus): Promise<boolean>;
}
//# sourceMappingURL=IUserRepository.d.ts.map
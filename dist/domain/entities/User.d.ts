export declare enum UserRole {
    ADMIN = "admin",
    AUTHOR = "author"
}
export declare enum UserStatus {
    ACTIVE = "active",
    DISABLED = "disabled",
    DELETED = "deleted"
}
export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    status: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IUserPublic {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=User.d.ts.map
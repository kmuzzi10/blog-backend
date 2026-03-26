export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

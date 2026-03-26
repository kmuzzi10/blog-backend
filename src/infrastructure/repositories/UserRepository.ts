import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IUser, IUserPublic, UserRole } from '../../domain/entities/User';
import { UserModel } from '../database/models/UserModel';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).select('+password').lean().exec() as unknown as Promise<IUser | null>;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').lean().exec() as unknown as Promise<IUser | null>;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    role?: string;
  } = {}): Promise<{ users: IUserPublic[]; total: number }> {
    const { page = 1, limit = 10, role } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      UserModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
      UserModel.countDocuments(filter),
    ]);

    return { users: users as unknown as IUserPublic[], total };
  }

  async create(
    user: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IUser> {
    const created = await UserModel.create(user);
    return created.toObject() as unknown as IUser;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean()
      .exec() as unknown as Promise<IUser | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countAll(): Promise<number> {
    return UserModel.countDocuments();
  }
}

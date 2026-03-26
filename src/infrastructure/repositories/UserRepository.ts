import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IUser, IUserPublic, UserStatus } from '../../domain/entities/User';
import { UserModel } from '../database/models/UserModel';
import { PostModel } from '../database/models/PostModel';
import { CommentModel } from '../database/models/CommentModel';
import mongoose from 'mongoose';

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
    search?: string;
  } = {}): Promise<{ users: IUserPublic[]; total: number }> {
    const { page = 1, limit = 10, role, search } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { status: { $ne: UserStatus.DELETED } };
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

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
    return UserModel.countDocuments({ status: UserStatus.ACTIVE });
  }

  async getAuthorDashboard(userId: string): Promise<any> {
    const authorObjectId = new mongoose.Types.ObjectId(userId);
    
    // Total posts
    const postCount = await PostModel.countDocuments({ authorId: authorObjectId });
    
    // Get all post IDs for this user to fetch related comments
    const posts = await PostModel.find({ authorId: authorObjectId }).select('_id');
    const postIds = posts.map(p => p._id);
    
    // Total comments received across all my posts
    const commentCount = await CommentModel.countDocuments({ postId: { $in: postIds } });

    // Recent activities feed
    const [recentPosts, recentComments] = await Promise.all([
      PostModel.find({ authorId: authorObjectId })
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      CommentModel.find({ postId: { $in: postIds } })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return {
      stats: {
        totalPosts: postCount,
        totalComments: commentCount,
      },
      recentPosts: recentPosts.map((p: any) => ({
        ...p,
        id: String(p._id),
        categoryName: p.categoryId?.name
      })),
      recentComments: recentComments.map((c: any) => ({
        ...c,
        id: String(c._id),
        author: c.authorId,
        postTitle: c.postId?.title
      }))
    };
  }

  async getAdminDashboard(): Promise<any> {
    const stats = await Promise.all([
      PostModel.countDocuments({ status: { $ne: 'Deleted by Admin' } }),
      CommentModel.countDocuments(),
      UserModel.countDocuments({ status: UserStatus.ACTIVE }),
      PostModel.aggregate([
        { $match: { status: { $ne: 'Deleted by Admin' } } },
        { $group: { _id: null, totalViews: { $sum: "$viewCount" } } }
      ])
    ]);

    const recordStats = {
      totalPosts: stats[0],
      totalComments: stats[1],
      totalUsers: stats[2],
      totalViews: stats[3][0]?.totalViews || 0
    };

    const [recentPosts, recentComments] = await Promise.all([
      PostModel.find({ status: { $ne: 'Deleted by Admin' } })
        .populate('authorId', 'name avatar')
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      CommentModel.find()
        .populate('authorId', 'name avatar')
        .populate('postId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return {
      stats: recordStats,
      recentPosts: recentPosts.map((p: any) => ({
        ...p,
        id: String(p._id),
        categoryName: p.categoryId?.name,
        authorName: p.authorId?.name
      })),
      recentComments: recentComments.map((c: any) => ({
        ...c,
        id: String(c._id),
        author: c.authorId,
        postTitle: c.postId?.title
      }))
    };
  }

  async moderateStatus(id: string, status: UserStatus): Promise<boolean> {
    const result = await UserModel.findByIdAndUpdate(id, { $set: { status } }).exec();
    
    if (status === UserStatus.DELETED) {
      // Cascade: Delete all posts by this user
      await PostModel.updateMany({ authorId: id }, { $set: { status: 'Deleted by Admin' } }).exec();
    }
    
    return result !== null;
  }
}

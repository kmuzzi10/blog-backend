"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_1 = require("../../domain/entities/User");
const UserModel_1 = require("../database/models/UserModel");
const PostModel_1 = require("../database/models/PostModel");
const CommentModel_1 = require("../database/models/CommentModel");
const mongoose_1 = __importDefault(require("mongoose"));
class UserRepository {
    async findById(id) {
        return UserModel_1.UserModel.findById(id).select('+password').lean().exec();
    }
    async findByEmail(email) {
        return UserModel_1.UserModel.findOne({ email: email.toLowerCase() }).select('+password').lean().exec();
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10, role, search } = options;
        const skip = (page - 1) * limit;
        const filter = { status: { $ne: User_1.UserStatus.DELETED } };
        if (role)
            filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const [users, total] = await Promise.all([
            UserModel_1.UserModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean().exec(),
            UserModel_1.UserModel.countDocuments(filter),
        ]);
        return { users: users, total };
    }
    async create(user) {
        const created = await UserModel_1.UserModel.create(user);
        return created.toObject();
    }
    async update(id, data) {
        return UserModel_1.UserModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
            .lean()
            .exec();
    }
    async delete(id) {
        const result = await UserModel_1.UserModel.findByIdAndDelete(id).exec();
        return result !== null;
    }
    async countAll() {
        return UserModel_1.UserModel.countDocuments({ status: User_1.UserStatus.ACTIVE });
    }
    async getAuthorDashboard(userId) {
        const authorObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // Total posts
        const postCount = await PostModel_1.PostModel.countDocuments({ authorId: authorObjectId });
        // Get all post IDs for this user to fetch related comments
        const posts = await PostModel_1.PostModel.find({ authorId: authorObjectId }).select('_id');
        const postIds = posts.map(p => p._id);
        // Total comments received across all my posts
        const commentCount = await CommentModel_1.CommentModel.countDocuments({ postId: { $in: postIds } });
        // Recent activities feed
        const [recentPosts, recentComments] = await Promise.all([
            PostModel_1.PostModel.find({ authorId: authorObjectId })
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            CommentModel_1.CommentModel.find({ postId: { $in: postIds } })
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
            recentPosts: recentPosts.map((p) => ({
                ...p,
                id: String(p._id),
                categoryName: p.categoryId?.name
            })),
            recentComments: recentComments.map((c) => ({
                ...c,
                id: String(c._id),
                author: c.authorId,
                postTitle: c.postId?.title
            }))
        };
    }
    async getAdminDashboard() {
        const stats = await Promise.all([
            PostModel_1.PostModel.countDocuments({ status: { $ne: 'Deleted by Admin' } }),
            CommentModel_1.CommentModel.countDocuments(),
            UserModel_1.UserModel.countDocuments({ status: User_1.UserStatus.ACTIVE }),
            PostModel_1.PostModel.aggregate([
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
            PostModel_1.PostModel.find({ status: { $ne: 'Deleted by Admin' } })
                .populate('authorId', 'name avatar')
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            CommentModel_1.CommentModel.find()
                .populate('authorId', 'name avatar')
                .populate('postId', 'title')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);
        return {
            stats: recordStats,
            recentPosts: recentPosts.map((p) => ({
                ...p,
                id: String(p._id),
                categoryName: p.categoryId?.name,
                authorName: p.authorId?.name
            })),
            recentComments: recentComments.map((c) => ({
                ...c,
                id: String(c._id),
                author: c.authorId,
                postTitle: c.postId?.title
            }))
        };
    }
    async moderateStatus(id, status) {
        const result = await UserModel_1.UserModel.findByIdAndUpdate(id, { $set: { status } }).exec();
        if (status === User_1.UserStatus.DELETED) {
            // Cascade: Delete all posts by this user
            await PostModel_1.PostModel.updateMany({ authorId: id }, { $set: { status: 'Deleted by Admin' } }).exec();
        }
        return result !== null;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Post_1 = require("../../domain/entities/Post");
const PostModel_1 = require("../database/models/PostModel");
const CommentModel_1 = require("../database/models/CommentModel");
class PostRepository {
    buildPopulate() {
        return [
            { path: 'authorId', select: 'name avatar bio', model: 'User' },
            { path: 'categoryId', select: 'name slug', model: 'Category' },
        ];
    }
    async findById(id) {
        const post = await PostModel_1.PostModel.findById(id)
            .populate(this.buildPopulate())
            .lean()
            .exec();
        if (!post)
            return null;
        const comments = await CommentModel_1.CommentModel.find({ postId: id })
            .populate('authorId', 'name avatar')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const publicPost = this.mapToPublic(post);
        if (publicPost) {
            publicPost.commentCount = comments.length;
            publicPost.comments = comments.map(c => ({
                ...c,
                id: String(c._id),
                author: c.authorId
            }));
        }
        return publicPost;
    }
    async findBySlug(slug) {
        const post = await PostModel_1.PostModel.findOne({ slug })
            .populate(this.buildPopulate())
            .lean()
            .exec();
        if (!post)
            return null;
        const comments = await CommentModel_1.CommentModel.find({ postId: post._id })
            .populate('authorId', 'name avatar')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const publicPost = this.mapToPublic(post);
        if (publicPost) {
            publicPost.commentCount = comments.length;
            publicPost.comments = comments.map(c => ({
                ...c,
                id: String(c._id),
                author: c.authorId
            }));
        }
        return publicPost;
    }
    async findAll(options = {}) {
        const { page = 1, limit = 10, status, categoryId, tags, authorId, search, } = options;
        const skip = (page - 1) * limit;
        const match = {};
        if (status) {
            match.status = status;
        }
        else {
            // Hide moderated content by default
            match.status = { $ne: Post_1.PostStatus.DELETED_BY_ADMIN };
        }
        if (categoryId)
            match.categoryId = new mongoose_1.default.Types.ObjectId(categoryId);
        if (authorId)
            match.authorId = new mongoose_1.default.Types.ObjectId(authorId);
        if (tags?.length)
            match.tags = { $in: tags };
        // Escape regex special characters to prevent crashes
        const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
        const regexQuery = escapedSearch ? { $regex: escapedSearch, $options: 'i' } : null;
        const pipeline = [
            { $match: match },
            // 👤 Author populate
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
            // 📂 Category populate
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            // 🔍 Powerful Multi-field Search
            ...(regexQuery
                ? [
                    {
                        $match: {
                            $or: [
                                { title: regexQuery },
                                { content: regexQuery },
                                { excerpt: regexQuery },
                                { tags: regexQuery },
                                { 'author.name': regexQuery },
                                { 'category.name': regexQuery },
                            ],
                        },
                    },
                ]
                : []),
            // 💬 Comment count
            {
                $lookup: {
                    from: 'comments',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$postId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'commentData',
                },
            },
            {
                $addFields: {
                    commentCount: {
                        $ifNull: [{ $arrayElemAt: ['$commentData.count', 0] }, 0],
                    },
                },
            },
            // 🧹 Clean response fields
            {
                $project: {
                    commentData: 0,
                    'author.password': 0,
                    'author.__v': 0,
                    'category.__v': 0,
                },
            },
            // 📊 Sorting + Pagination
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ];
        const [posts, totalResult] = await Promise.all([
            PostModel_1.PostModel.aggregate(pipeline),
            PostModel_1.PostModel.aggregate([
                { $match: match },
                ...(regexQuery
                    ? [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'authorId',
                                foreignField: '_id',
                                as: 'author',
                            },
                        },
                        { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'categories',
                                localField: 'categoryId',
                                foreignField: '_id',
                                as: 'category',
                            },
                        },
                        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
                        {
                            $match: {
                                $or: [
                                    { title: regexQuery },
                                    { content: regexQuery },
                                    { excerpt: regexQuery },
                                    { tags: regexQuery },
                                    { 'author.name': regexQuery },
                                    { 'category.name': regexQuery },
                                ],
                            },
                        },
                    ]
                    : []),
                { $count: 'total' },
            ]),
        ]);
        const total = totalResult[0]?.total || 0;
        return {
            posts: posts
                .map((p) => this.mapToPublic(p))
                .filter((p) => p !== null),
            total,
        };
    }
    async findPublished(options = {}) {
        return this.findAll({ ...options, status: Post_1.PostStatus.PUBLISHED });
    }
    async create(post) {
        const created = await PostModel_1.PostModel.create(post);
        return created.toObject();
    }
    async update(id, data) {
        return PostModel_1.PostModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
            .lean()
            .exec();
    }
    async delete(id) {
        const result = await PostModel_1.PostModel.findByIdAndDelete(id).exec();
        return result !== null;
    }
    async incrementViewCount(id) {
        await PostModel_1.PostModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    }
    async slugExists(slug, excludeId) {
        const filter = { slug };
        if (excludeId)
            filter._id = { $ne: excludeId };
        const count = await PostModel_1.PostModel.countDocuments(filter);
        return count > 0;
    }
    mapToPublic(post) {
        if (!post)
            return null;
        // Support both Mongoose populate (authorId is object) and Aggregation lookup (author is object)
        const authorData = (post.authorId && typeof post.authorId === 'object' && post.authorId.name
            ? post.authorId
            : post.author);
        const categoryData = (post.categoryId && typeof post.categoryId === 'object' && post.categoryId.name
            ? post.categoryId
            : post.category);
        return {
            ...post,
            _id: String(post._id),
            authorId: authorData?._id ? String(authorData._id) : String(post.authorId),
            author: authorData?._id
                ? {
                    _id: String(authorData._id),
                    name: String(authorData.name || ''),
                    avatar: authorData.avatar,
                    bio: authorData.bio,
                }
                : undefined,
            category: categoryData?._id
                ? {
                    _id: String(categoryData._id),
                    name: String(categoryData.name || ''),
                    slug: String(categoryData.slug || ''),
                }
                : undefined,
        };
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=PostRepository.js.map
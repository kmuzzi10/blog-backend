import mongoose from 'mongoose';
import { IPostRepository, PostQueryOptions } from '../../domain/interfaces/IPostRepository';
import { IPost, IPostPublic, PostStatus } from '../../domain/entities/Post';
import { PostModel } from '../database/models/PostModel';
import { UserModel } from '../database/models/UserModel';
import { CommentModel } from '../database/models/CommentModel';

export class PostRepository implements IPostRepository {
  private buildPopulate() {
    return [
      { path: 'authorId', select: 'name avatar bio', model: 'User' },
      { path: 'categoryId', select: 'name slug', model: 'Category' },
    ];
  }

  async findById(id: string): Promise<IPostPublic | null> {
    const post = await PostModel.findById(id)
      .populate(this.buildPopulate())
      .lean()
      .exec();

    if (!post) return null;

    const comments = await CommentModel.find({ postId: id })
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


  async findBySlug(slug: string): Promise<IPostPublic | null> {
    const post = await PostModel.findOne({ slug })
      .populate(this.buildPopulate())
      .lean()
      .exec();

    if (!post) return null;

    const comments = await CommentModel.find({ postId: post._id })
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



  async findAll(
    options: PostQueryOptions = {},
  ): Promise<{ posts: IPostPublic[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      tags,
      authorId,
      search,
    } = options;

    const skip = (page - 1) * limit;

    const match: Record<string, any> = {};
    
    if (status) {
      match.status = status;
    } else {
      // Hide moderated content by default
      match.status = { $ne: PostStatus.DELETED_BY_ADMIN };
    }
    if (categoryId) match.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (authorId) match.authorId = new mongoose.Types.ObjectId(authorId);
    if (tags?.length) match.tags = { $in: tags };

    // Escape regex special characters to prevent crashes
    const escapedSearch = search ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
    const regexQuery = escapedSearch ? { $regex: escapedSearch, $options: 'i' } : null;

    const pipeline: any[] = [
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
      PostModel.aggregate(pipeline),
      PostModel.aggregate([
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
        .filter((p): p is IPostPublic => p !== null),
      total,
    };
  }



  async findPublished(
    options: Omit<PostQueryOptions, 'status'> = {},
  ): Promise<{ posts: IPostPublic[]; total: number }> {
    return this.findAll({ ...options, status: PostStatus.PUBLISHED });
  }

  async create(
    post: Omit<IPost, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<IPost> {
    const created = await PostModel.create(post);
    return created.toObject() as unknown as IPost;
  }

  async update(id: string, data: Partial<IPost>): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean()
      .exec() as unknown as Promise<IPost | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async incrementViewCount(id: string): Promise<void> {
    await PostModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };
    const count = await PostModel.countDocuments(filter);
    return count > 0;
  }

  private mapToPublic(post: Record<string, unknown> | null): IPostPublic | null {
    if (!post) return null;
    
    // Support both Mongoose populate (authorId is object) and Aggregation lookup (author is object)
    const authorData = (post.authorId && typeof post.authorId === 'object' && (post.authorId as any).name 
      ? post.authorId 
      : post.author) as Record<string, unknown> | null;
      
    const categoryData = (post.categoryId && typeof post.categoryId === 'object' && (post.categoryId as any).name 
      ? post.categoryId 
      : post.category) as Record<string, unknown> | null;

    return {
      ...post,
      _id: String(post._id),
      authorId: authorData?._id ? String(authorData._id) : String(post.authorId),
      author: authorData?._id
        ? {
          _id: String(authorData._id),
          name: String(authorData.name || ''),
          avatar: authorData.avatar as string | undefined,
          bio: authorData.bio as string | undefined,
        }
        : undefined,
      category: categoryData?._id
        ? {
          _id: String(categoryData._id),
          name: String(categoryData.name || ''),
          slug: String(categoryData.slug || ''),
        }
        : undefined,
    } as IPostPublic;
  }
}

import { IPostRepository, PostQueryOptions } from '../../domain/interfaces/IPostRepository';
import { IPost, IPostPublic, PostStatus } from '../../domain/entities/Post';
import { PostModel } from '../database/models/PostModel';

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
    return this.mapToPublic(post);
  }

  async findBySlug(slug: string): Promise<IPostPublic | null> {
    const post = await PostModel.findOne({ slug })
      .populate(this.buildPopulate())
      .lean()
      .exec();
    return this.mapToPublic(post);
  }

  async findAll(
    options: PostQueryOptions = {},
  ): Promise<{ posts: IPostPublic[]; total: number }> {
    const { page = 1, limit = 10, status, categoryId, tags, authorId, search } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (authorId) filter.authorId = authorId;
    if (tags && tags.length > 0) filter.tags = { $in: tags };
    if (search) filter.$text = { $search: search };

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .populate(this.buildPopulate())
        .skip(skip)
        .limit(limit)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .lean()
        .exec(),
      PostModel.countDocuments(filter),
    ]);

    return { posts: posts.map((p) => this.mapToPublic(p)!) as IPostPublic[], total };
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
    const authorData = post.authorId as Record<string, unknown> | null;
    const categoryData = post.categoryId as Record<string, unknown> | null;

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

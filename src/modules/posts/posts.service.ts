import { IPostRepository } from '../../domain/interfaces/IPostRepository';
import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
import { IPostPublic, PostStatus } from '../../domain/entities/Post';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './posts.dto';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/utils/AppError';
import { generateSlug, calculateReadTime, generateExcerpt } from '../../shared/utils/helpers';
import { UserRole } from '../../domain/entities/User';

export class PostService {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly blobStorageService?: IBlobStorageService,
  ) {}

  async createPost(
    userId: string,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<IPostPublic> {
    let slug = generateSlug(dto.title);
    const slugExists = await this.postRepository.slugExists(slug);

    if (slugExists) {
      slug = generateSlug(dto.title, true);
    }

    let featuredImage = null;

    if (file && this.blobStorageService) {
      const uploadResult = await this.blobStorageService.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
        'posts',
      );
      featuredImage = uploadResult.url;
    }

    const excerpt = dto.excerpt || generateExcerpt(dto.content);
    const readTime = calculateReadTime(dto.content);
    const publishedAt = dto.status === PostStatus.PUBLISHED ? new Date() : undefined;

    const post = await this.postRepository.create({
      title: dto.title,
      slug,
      content: dto.content,
      excerpt,
      featuredImage: featuredImage || undefined,
      status: dto.status as PostStatus,
      authorId: userId,
      categoryId: dto.categoryId,
      tags: dto.tags || [],
      readTime,
      viewCount: 0,
      publishedAt,
    });

    return this.postRepository.findById(post._id!.toString()) as Promise<IPostPublic>;
  }

  async getPosts(query: PostQueryDto): Promise<{ posts: IPostPublic[]; total: number }> {
    return this.postRepository.findAll(query);
  }

  async getPublishedPosts(query: Omit<PostQueryDto, 'status'>): Promise<{ posts: IPostPublic[]; total: number }> {
    return this.postRepository.findPublished(query);
  }

  async getPostBySlug(slug: string): Promise<IPostPublic> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Fire and forget view count increment
    this.postRepository.incrementViewCount(post._id.toString()).catch(() => {});

    return post;
  }

  async getPostById(id: string): Promise<IPostPublic> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  async updatePost(
    userId: string,
    userRole: string,
    postId: string,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<IPostPublic> {
    const existingPost = await this.getPostById(postId);

    if (existingPost.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    const updateData: any = { ...dto };

    if (dto.title && dto.title !== existingPost.title) {
      let slug = generateSlug(dto.title);
      const slugExists = await this.postRepository.slugExists(slug, postId);
      if (slugExists) slug = generateSlug(dto.title, true);
      updateData.slug = slug;
    }

    if (dto.content) {
      updateData.readTime = calculateReadTime(dto.content);
      if (!dto.excerpt && !existingPost.excerpt) {
        updateData.excerpt = generateExcerpt(dto.content);
      }
    }

    if (
      dto.status === PostStatus.PUBLISHED &&
      existingPost.status !== PostStatus.PUBLISHED
    ) {
      updateData.publishedAt = new Date();
    }

    if (file && this.blobStorageService) {
      const uploadResult = await this.blobStorageService.upload(
        file.buffer,
        file.originalname,
        file.mimetype,
        'posts',
      );
      
      // Optionally delete old image from blob storage here, ignoring errors
      if (existingPost.featuredImage) {
        this.blobStorageService.delete(existingPost.featuredImage).catch(() => {});
      }
      
      updateData.featuredImage = uploadResult.url;
    }

    await this.postRepository.update(postId, updateData);
    return this.getPostById(postId);
  }

  async deletePost(userId: string, userRole: string, postId: string): Promise<void> {
    const existingPost = await this.getPostById(postId);

    if (existingPost.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    if (existingPost.featuredImage && this.blobStorageService) {
      this.blobStorageService.delete(existingPost.featuredImage).catch(() => {});
    }

    await this.postRepository.delete(postId);
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const Post_1 = require("../../domain/entities/Post");
const AppError_1 = require("../../shared/utils/AppError");
const helpers_1 = require("../../shared/utils/helpers");
const User_1 = require("../../domain/entities/User");
class PostService {
    constructor(postRepository, blobStorageService) {
        this.postRepository = postRepository;
        this.blobStorageService = blobStorageService;
    }
    async createPost(userId, dto, file) {
        let slug = (0, helpers_1.generateSlug)(dto.title);
        const slugExists = await this.postRepository.slugExists(slug);
        if (slugExists) {
            slug = (0, helpers_1.generateSlug)(dto.title, true);
        }
        let featuredImage = null;
        if (file && this.blobStorageService) {
            const uploadResult = await this.blobStorageService.upload(file.buffer, file.originalname, file.mimetype, 'posts');
            featuredImage = uploadResult.url;
        }
        const excerpt = dto.excerpt || (0, helpers_1.generateExcerpt)(dto.content);
        const readTime = (0, helpers_1.calculateReadTime)(dto.content);
        const publishedAt = dto.status === Post_1.PostStatus.PUBLISHED ? new Date() : undefined;
        const post = await this.postRepository.create({
            title: dto.title,
            slug,
            content: dto.content,
            excerpt,
            featuredImage: featuredImage || undefined,
            status: dto.status,
            authorId: userId,
            categoryId: dto.categoryId,
            tags: dto.tags || [],
            readTime,
            viewCount: 0,
            publishedAt,
        });
        return this.postRepository.findById(post._id.toString());
    }
    async getPosts(query) {
        return this.postRepository.findAll(query);
    }
    async getPublishedPosts(query) {
        return this.postRepository.findPublished(query);
    }
    async getPostBySlug(slug) {
        const post = await this.postRepository.findBySlug(slug);
        if (!post) {
            throw new AppError_1.NotFoundError('Post not found');
        }
        // Fire and forget view count increment
        this.postRepository.incrementViewCount(post._id.toString()).catch(() => { });
        return post;
    }
    async getPostById(id) {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new AppError_1.NotFoundError('Post not found');
        }
        return post;
    }
    async updatePost(userId, userRole, postId, dto, file) {
        const existingPost = await this.getPostById(postId);
        if (existingPost.authorId !== userId && userRole !== User_1.UserRole.ADMIN) {
            throw new AppError_1.ForbiddenError('You can only edit your own posts');
        }
        const updateData = { ...dto };
        if (dto.title && dto.title !== existingPost.title) {
            let slug = (0, helpers_1.generateSlug)(dto.title);
            const slugExists = await this.postRepository.slugExists(slug, postId);
            if (slugExists)
                slug = (0, helpers_1.generateSlug)(dto.title, true);
            updateData.slug = slug;
        }
        if (dto.content) {
            updateData.readTime = (0, helpers_1.calculateReadTime)(dto.content);
            if (!dto.excerpt && !existingPost.excerpt) {
                updateData.excerpt = (0, helpers_1.generateExcerpt)(dto.content);
            }
        }
        if (dto.status === Post_1.PostStatus.PUBLISHED &&
            existingPost.status !== Post_1.PostStatus.PUBLISHED) {
            updateData.publishedAt = new Date();
        }
        if (file && this.blobStorageService) {
            const uploadResult = await this.blobStorageService.upload(file.buffer, file.originalname, file.mimetype, 'posts');
            // Optionally delete old image from blob storage here, ignoring errors
            if (existingPost.featuredImage) {
                this.blobStorageService.delete(existingPost.featuredImage).catch(() => { });
            }
            updateData.featuredImage = uploadResult.url;
        }
        await this.postRepository.update(postId, updateData);
        return this.getPostById(postId);
    }
    async deletePost(userId, userRole, postId) {
        const existingPost = await this.getPostById(postId);
        if (existingPost.authorId !== userId && userRole !== User_1.UserRole.ADMIN) {
            throw new AppError_1.ForbiddenError('You can only delete your own posts');
        }
        // If Admin is deleting SOMEONE ELSE'S post, we soft-delete it by changing status
        if (userRole === User_1.UserRole.ADMIN && existingPost.authorId !== userId) {
            await this.postRepository.update(postId, { status: Post_1.PostStatus.DELETED_BY_ADMIN });
            return;
        }
        // Otherwise (Author deleting own post, or Admin deleting own post), we perform physical delete
        if (existingPost.featuredImage && this.blobStorageService) {
            this.blobStorageService.delete(existingPost.featuredImage).catch(() => { });
        }
        await this.postRepository.delete(postId);
    }
}
exports.PostService = PostService;
//# sourceMappingURL=posts.service.js.map
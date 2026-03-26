import { IPost, IPostPublic, PostStatus } from '../entities/Post';
export interface PostQueryOptions {
    page?: number;
    limit?: number;
    status?: PostStatus;
    categoryId?: string;
    tags?: string[];
    authorId?: string;
    search?: string;
}
export interface IPostRepository {
    findById(id: string): Promise<IPostPublic | null>;
    findBySlug(slug: string): Promise<IPostPublic | null>;
    findAll(options?: PostQueryOptions): Promise<{
        posts: IPostPublic[];
        total: number;
    }>;
    findPublished(options?: Omit<PostQueryOptions, 'status'>): Promise<{
        posts: IPostPublic[];
        total: number;
    }>;
    create(post: Omit<IPost, '_id' | 'createdAt' | 'updatedAt'>): Promise<IPost>;
    update(id: string, data: Partial<IPost>): Promise<IPost | null>;
    delete(id: string): Promise<boolean>;
    incrementViewCount(id: string): Promise<void>;
    slugExists(slug: string, excludeId?: string): Promise<boolean>;
}
//# sourceMappingURL=IPostRepository.d.ts.map
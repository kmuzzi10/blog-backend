import { IPostRepository, PostQueryOptions } from '../../domain/interfaces/IPostRepository';
import { IPost, IPostPublic } from '../../domain/entities/Post';
export declare class PostRepository implements IPostRepository {
    private buildPopulate;
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
    private mapToPublic;
}
//# sourceMappingURL=PostRepository.d.ts.map
import { IPostRepository } from '../../domain/interfaces/IPostRepository';
import { IBlobStorageService } from '../../domain/interfaces/IBlobStorageService';
import { IPostPublic } from '../../domain/entities/Post';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './posts.dto';
export declare class PostService {
    private readonly postRepository;
    private readonly blobStorageService?;
    constructor(postRepository: IPostRepository, blobStorageService?: IBlobStorageService | undefined);
    createPost(userId: string, dto: CreatePostDto, file?: Express.Multer.File): Promise<IPostPublic>;
    getPosts(query: PostQueryDto): Promise<{
        posts: IPostPublic[];
        total: number;
    }>;
    getPublishedPosts(query: Omit<PostQueryDto, 'status'>): Promise<{
        posts: IPostPublic[];
        total: number;
    }>;
    getPostBySlug(slug: string): Promise<IPostPublic>;
    getPostById(id: string): Promise<IPostPublic>;
    updatePost(userId: string, userRole: string, postId: string, dto: UpdatePostDto, file?: Express.Multer.File): Promise<IPostPublic>;
    deletePost(userId: string, userRole: string, postId: string): Promise<void>;
}
//# sourceMappingURL=posts.service.d.ts.map
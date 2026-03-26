import { ICommentRepository } from '../../domain/interfaces/ICommentRepository';
import { IComment } from '../../domain/entities/Comment';
export declare class CommentRepository implements ICommentRepository {
    findById(id: string): Promise<IComment | null>;
    findByPostId(postId: string, query?: {
        page?: number;
        limit?: number;
    }): Promise<{
        comments: IComment[];
        total: number;
    }>;
    create(comment: Omit<IComment, '_id' | 'createdAt' | 'updatedAt' | 'isEdited'>): Promise<IComment>;
    update(id: string, content: string): Promise<IComment | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=CommentRepository.d.ts.map
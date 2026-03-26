import { ICommentRepository } from '../../domain/interfaces/ICommentRepository';
import { IComment } from '../../domain/entities/Comment';
export declare class CommentService {
    private commentRepository;
    constructor(commentRepository: ICommentRepository);
    getCommentsByPostId(postId: string, query: {
        page?: number;
        limit?: number;
    }): Promise<{
        comments: IComment[];
        total: number;
    }>;
    createComment(data: {
        content: string;
        authorId: string;
        postId: string;
    }): Promise<IComment>;
    updateComment(id: string, content: string, userId: string): Promise<IComment>;
    deleteComment(id: string, userId: string, userRole: string): Promise<void>;
}
//# sourceMappingURL=comments.service.d.ts.map
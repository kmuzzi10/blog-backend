import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comments.service';
export declare class CommentController {
    private commentService;
    constructor(commentService: CommentService);
    getCommentsByPostId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=comments.controller.d.ts.map
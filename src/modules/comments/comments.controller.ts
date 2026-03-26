import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comments.service';

export class CommentController {
  constructor(private commentService: CommentService) {}

  getCommentsByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { postId } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await this.commentService.getCommentsByPostId(postId, { page, limit });
      
      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { content, postId } = req.body;
      const authorId = req.user!.userId; // Authenticated user
      
      const comment = await this.commentService.createComment({ content, authorId, postId });
      
      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user!.userId;

      const updatedComment = await this.commentService.updateComment(id, content, userId);
      
      res.status(200).json({
        success: true,
        data: updatedComment,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      await this.commentService.deleteComment(id, userId, userRole);
      
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

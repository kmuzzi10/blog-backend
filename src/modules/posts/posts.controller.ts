import { Request, Response } from 'express';
import { PostService } from './posts.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/apiResponse';

export class PostController {
  constructor(private readonly postService: PostService) {}

  createPost = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    // ensure tags are parsed back to array if came as string from FormData
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch {
        req.body.tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    
    // Cleanup categoryId if empty string (prevents Mongoose CastError)
    if (req.body.categoryId === '') {
      delete req.body.categoryId;
    }
    
    const post = await this.postService.createPost(userId, req.body, req.file);
    sendSuccess(res, post, 'Post created successfully', 201);
  });

  getPosts = asyncHandler(async (req: Request, res: Response) => {
    // If admin is requesting, they probably want all posts regardless of status
    // Unless status is explicitly provided
    if (req.user?.role === 'admin' && !req.query.status) {
       const { posts, total } = await this.postService.getPosts(req.query as any);
       sendPaginated(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'Posts retrieved');
       return;
    }

    // Default: only published posts for public access
    const { posts, total } = await this.postService.getPublishedPosts(req.query as any);
    sendPaginated(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'Published posts retrieved');
  });

  getMyPosts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const query = { ...req.query, authorId: userId };
    const { posts, total } = await this.postService.getPosts(query as any);
    sendPaginated(res, posts, total, Number(req.query.page) || 1, Number(req.query.limit) || 10, 'My posts retrieved');
  });

  getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const post = await this.postService.getPostBySlug(slug);
    sendSuccess(res, post, 'Post retrieved');
  });

  getPostById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = await this.postService.getPostById(id);
    sendSuccess(res, post, 'Post retrieved');
  });

  updatePost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    // Parse tags similarly to create
    if (typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch {
        req.body.tags = req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    
    // Cleanup categoryId if empty string (prevents Mongoose CastError)
    if (req.body.categoryId === '') {
      delete req.body.categoryId;
    }

    const post = await this.postService.updatePost(userId, userRole, id, req.body, req.file);
    sendSuccess(res, post, 'Post updated successfully');
  });

  deletePost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    await this.postService.deletePost(userId, userRole, id);
    sendSuccess(res, null, 'Post deleted successfully');
  });
}

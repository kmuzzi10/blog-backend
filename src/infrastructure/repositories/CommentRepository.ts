import { ICommentRepository } from '../../domain/interfaces/ICommentRepository';
import { IComment } from '../../domain/entities/Comment';
import { CommentModel } from '../database/models/CommentModel';

export class CommentRepository implements ICommentRepository {
  async findById(id: string): Promise<IComment | null> {
    return CommentModel.findById(id).lean().exec() as unknown as Promise<IComment | null>;
  }

  async findByPostId(
    postId: string,
    query?: { page?: number; limit?: number }
  ): Promise<{ comments: IComment[]; total: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      CommentModel.find({ postId })
        .populate('authorId', 'firstName lastName avatar role') // get author details securely
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      CommentModel.countDocuments({ postId }).exec(),
    ]);

    return {
      comments: comments as unknown as IComment[],
      total,
    };
  }

  async create(
    comment: Omit<IComment, '_id' | 'createdAt' | 'updatedAt' | 'isEdited'>
  ): Promise<IComment> {
    const created = await CommentModel.create(comment);
    return created.toObject() as unknown as IComment;
  }

  async update(id: string, content: string): Promise<IComment | null> {
    return CommentModel.findByIdAndUpdate(
      id,
      { $set: { content, isEdited: true } },
      { new: true, runValidators: true }
    )
      .lean()
      .exec() as unknown as Promise<IComment | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

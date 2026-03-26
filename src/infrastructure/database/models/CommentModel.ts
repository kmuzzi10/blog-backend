import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComment } from '../../../domain/entities/Comment';

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    postId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Post',
      required: [true, 'Post ID is required'],
    },
    authorId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Comment',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

CommentSchema.index({ postId: 1 });
CommentSchema.index({ authorId: 1 });
CommentSchema.index({ isApproved: 1 });
CommentSchema.index({ postId: 1, isApproved: 1 });
CommentSchema.index({ parentId: 1 });

export const CommentModel: Model<ICommentDocument> = mongoose.model<ICommentDocument>(
  'Comment',
  CommentSchema,
);

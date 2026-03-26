import mongoose, { Schema, Document, Model } from 'mongoose';
import { IComment } from '../../../domain/entities/Comment';

export interface ICommentDocument extends Omit<IComment, '_id'>, Document {}

const CommentSchema = new Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
    authorId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Post',
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
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

// Indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ authorId: 1 });

export const CommentModel: Model<ICommentDocument> = mongoose.model<ICommentDocument>(
  'Comment',
  CommentSchema,
);

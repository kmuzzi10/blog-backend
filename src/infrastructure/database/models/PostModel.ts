import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPost, PostStatus } from '../../../domain/entities/Post';

export interface IPostDocument extends Omit<IPost, '_id'>, Document {}

const PostSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    featuredImage: {
      type: String,
      default: null,
    },
    featuredVideo: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.DRAFT,
    },
    authorId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Category',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        (ret as any).id = (ret as any)._id.toString();
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Text index for full-text search on title + content
PostSchema.index({ title: 'text', content: 'text', tags: 'text' }, { weights: { title: 10, tags: 5, content: 1 } });

// Other indexes
PostSchema.index({ slug: 1 }, { unique: true });
PostSchema.index({ authorId: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ createdAt: -1 });

// Compound indexes
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ authorId: 1, status: 1 });
PostSchema.index({ categoryId: 1, status: 1 });

export const PostModel: Model<IPostDocument> = mongoose.model<IPostDocument>('Post', PostSchema);

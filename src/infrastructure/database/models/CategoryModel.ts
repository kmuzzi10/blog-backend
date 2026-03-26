import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory } from '../../../domain/entities/Category';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
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

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ name: 'text' });

export const CategoryModel: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>(
  'Category',
  CategorySchema,
);

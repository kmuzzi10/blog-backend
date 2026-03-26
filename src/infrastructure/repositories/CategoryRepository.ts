import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { ICategory } from '../../domain/entities/Category';
import { CategoryModel } from '../database/models/CategoryModel';

export class CategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<ICategory | null> {
    return CategoryModel.findById(id).lean().exec() as unknown as Promise<ICategory | null>;
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return CategoryModel.findOne({ slug }).lean().exec() as unknown as Promise<ICategory | null>;
  }

  async findAll(): Promise<ICategory[]> {
    return CategoryModel.find().sort({ name: 1 }).lean().exec() as unknown as Promise<ICategory[]>;
  }

  async create(
    category: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ICategory> {
    const created = await CategoryModel.create(category);
    return created.toObject() as unknown as ICategory;
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
      .lean()
      .exec() as unknown as Promise<ICategory | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

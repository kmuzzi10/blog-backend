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

  async findAll(query?: { page?: number; limit?: number; search?: string }): Promise<{ categories: ICategory[], total: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (query?.search) {
      filter.$text = { $search: query.search };
    }

    const [categories, total] = await Promise.all([
      CategoryModel.find(filter)
        .sort(query?.search ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      CategoryModel.countDocuments(filter).exec()
    ]);

    return { 
      categories: categories as unknown as ICategory[],
      total 
    };
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

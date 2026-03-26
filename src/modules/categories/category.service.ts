import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { ICategory } from '../../domain/entities/Category';
import slugify from 'slugify';
import { AppError } from '../../shared/utils/AppError';

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getCategories(query: { page?: number; limit?: number; search?: string }) {
    return this.categoryRepository.findAll(query);
  }

  async createCategory(data: { name: string; description?: string }): Promise<ICategory> {
    const slug = slugify(data.name, { lower: true, strict: true });

    // Check if category with same slug already exists
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) {
      throw new AppError('Category with this name already exists', 409);
    }

    return this.categoryRepository.create({
      name: data.name,
      slug,
      description: data.description,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const deleted = await this.categoryRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete category', 500);
    }
  }
}

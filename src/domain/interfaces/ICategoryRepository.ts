import { ICategory } from '../entities/Category';

export interface ICategoryRepository {
  findById(id: string): Promise<ICategory | null>;
  findBySlug(slug: string): Promise<ICategory | null>;
  findAll(): Promise<ICategory[]>;
  create(category: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICategory>;
  update(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
  delete(id: string): Promise<boolean>;
}

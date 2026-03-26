import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { ICategory } from '../../domain/entities/Category';
export declare class CategoryRepository implements ICategoryRepository {
    findById(id: string): Promise<ICategory | null>;
    findBySlug(slug: string): Promise<ICategory | null>;
    findAll(query?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        categories: ICategory[];
        total: number;
    }>;
    create(category: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICategory>;
    update(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=CategoryRepository.d.ts.map
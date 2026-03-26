import { ICategory } from '../entities/Category';
export interface ICategoryRepository {
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
//# sourceMappingURL=ICategoryRepository.d.ts.map
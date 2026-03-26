import { ICategoryRepository } from '../../domain/interfaces/ICategoryRepository';
import { ICategory } from '../../domain/entities/Category';
export declare class CategoryService {
    private categoryRepository;
    constructor(categoryRepository: ICategoryRepository);
    getCategories(query: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        categories: ICategory[];
        total: number;
    }>;
    createCategory(data: {
        name: string;
        description?: string;
    }): Promise<ICategory>;
    deleteCategory(id: string): Promise<void>;
}
//# sourceMappingURL=category.service.d.ts.map
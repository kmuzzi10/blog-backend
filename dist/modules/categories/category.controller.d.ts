import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
export declare class CategoryController {
    private categoryService;
    constructor(categoryService: CategoryService);
    getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=category.controller.d.ts.map
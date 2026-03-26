"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
        this.getCategories = async (req, res, next) => {
            try {
                const page = req.query.page ? Number(req.query.page) : 1;
                const limit = req.query.limit ? Number(req.query.limit) : 10;
                const search = req.query.search;
                const result = await this.categoryService.getCategories({ page, limit, search });
                res.status(200).json({
                    success: true,
                    data: result.categories,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: Math.ceil(result.total / limit),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCategory = async (req, res, next) => {
            try {
                const { name, description } = req.body;
                const category = await this.categoryService.createCategory({ name, description });
                res.status(201).json({
                    success: true,
                    data: category,
                    message: 'Category created successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCategory = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.categoryService.deleteCategory(id);
                res.status(200).json({
                    success: true,
                    message: 'Category deleted successfully',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=category.controller.js.map
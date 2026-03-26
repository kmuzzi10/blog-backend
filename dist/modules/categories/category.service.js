"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const slugify_1 = __importDefault(require("slugify"));
const AppError_1 = require("../../shared/utils/AppError");
class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async getCategories(query) {
        return this.categoryRepository.findAll(query);
    }
    async createCategory(data) {
        const slug = (0, slugify_1.default)(data.name, { lower: true, strict: true });
        // Check if category with same slug already exists
        const existing = await this.categoryRepository.findBySlug(slug);
        if (existing) {
            throw new AppError_1.AppError('Category with this name already exists', 409);
        }
        return this.categoryRepository.create({
            name: data.name,
            slug,
            description: data.description,
        });
    }
    async deleteCategory(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new AppError_1.AppError('Category not found', 404);
        }
        const deleted = await this.categoryRepository.delete(id);
        if (!deleted) {
            throw new AppError_1.AppError('Failed to delete category', 500);
        }
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map
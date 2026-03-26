"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const CategoryModel_1 = require("../database/models/CategoryModel");
class CategoryRepository {
    async findById(id) {
        return CategoryModel_1.CategoryModel.findById(id).lean().exec();
    }
    async findBySlug(slug) {
        return CategoryModel_1.CategoryModel.findOne({ slug }).lean().exec();
    }
    async findAll(query) {
        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (query?.search) {
            filter.$text = { $search: query.search };
        }
        const [categories, total] = await Promise.all([
            CategoryModel_1.CategoryModel.find(filter)
                .sort(query?.search ? { score: { $meta: 'textScore' } } : { name: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            CategoryModel_1.CategoryModel.countDocuments(filter).exec()
        ]);
        return {
            categories: categories,
            total
        };
    }
    async create(category) {
        const created = await CategoryModel_1.CategoryModel.create(category);
        return created.toObject();
    }
    async update(id, data) {
        return CategoryModel_1.CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
            .lean()
            .exec();
    }
    async delete(id) {
        const result = await CategoryModel_1.CategoryModel.findByIdAndDelete(id).exec();
        return result !== null;
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=CategoryRepository.js.map
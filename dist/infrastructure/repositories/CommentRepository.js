"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const CommentModel_1 = require("../database/models/CommentModel");
class CommentRepository {
    async findById(id) {
        return CommentModel_1.CommentModel.findById(id).lean().exec();
    }
    async findByPostId(postId, query) {
        const page = query?.page || 1;
        const limit = query?.limit || 10;
        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            CommentModel_1.CommentModel.find({ postId })
                .populate('authorId', 'firstName lastName avatar role') // get author details securely
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            CommentModel_1.CommentModel.countDocuments({ postId }).exec(),
        ]);
        return {
            comments: comments,
            total,
        };
    }
    async create(comment) {
        const created = await CommentModel_1.CommentModel.create(comment);
        return created.toObject();
    }
    async update(id, content) {
        return CommentModel_1.CommentModel.findByIdAndUpdate(id, { $set: { content, isEdited: true } }, { new: true, runValidators: true })
            .lean()
            .exec();
    }
    async delete(id) {
        const result = await CommentModel_1.CommentModel.findByIdAndDelete(id).exec();
        return result !== null;
    }
}
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=CommentRepository.js.map
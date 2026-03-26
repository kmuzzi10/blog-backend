"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Post_1 = require("../../../domain/entities/Post");
const PostSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    featuredImage: {
        type: String,
        default: null,
    },
    featuredVideo: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: Object.values(Post_1.PostStatus),
        default: Post_1.PostStatus.DRAFT,
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required'],
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    tags: {
        type: [String],
        default: [],
    },
    readTime: {
        type: Number,
        default: 0,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    publishedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret.__v;
            return ret;
        },
    },
});
// Text index for full-text search on title + content
PostSchema.index({ title: 'text', content: 'text', tags: 'text' }, { weights: { title: 10, tags: 5, content: 1 } });
// Other indexes
PostSchema.index({ authorId: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ publishedAt: -1 });
PostSchema.index({ createdAt: -1 });
// Compound indexes
PostSchema.index({ status: 1, publishedAt: -1 });
PostSchema.index({ authorId: 1, status: 1 });
PostSchema.index({ categoryId: 1, status: 1 });
exports.PostModel = mongoose_1.default.model('Post', PostSchema);
//# sourceMappingURL=PostModel.js.map
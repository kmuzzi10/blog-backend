"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExcerpt = exports.stripHtml = exports.calculateReadTime = exports.generateSlug = void 0;
const slugify_1 = __importDefault(require("slugify"));
/**
 * Generates a URL-friendly slug from a title.
 * Appends a short random suffix to reduce collision chance.
 */
const generateSlug = (title, withSuffix = false) => {
    const base = (0, slugify_1.default)(title, {
        lower: true,
        strict: true,
        trim: true,
    });
    if (withSuffix) {
        const suffix = Math.random().toString(36).substring(2, 7);
        return `${base}-${suffix}`;
    }
    return base;
};
exports.generateSlug = generateSlug;
/**
 * Estimates reading time in minutes based on word count.
 * Average reading speed: 200 words per minute.
 */
const calculateReadTime = (content) => {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
};
exports.calculateReadTime = calculateReadTime;
/**
 * Strips HTML tags from a string for plain text excerpts.
 */
const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '');
};
exports.stripHtml = stripHtml;
/**
 * Generates a short excerpt from content.
 */
const generateExcerpt = (content, maxLength = 160) => {
    const stripped = (0, exports.stripHtml)(content);
    if (stripped.length <= maxLength)
        return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
};
exports.generateExcerpt = generateExcerpt;
//# sourceMappingURL=helpers.js.map
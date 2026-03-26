/**
 * Generates a URL-friendly slug from a title.
 * Appends a short random suffix to reduce collision chance.
 */
export declare const generateSlug: (title: string, withSuffix?: boolean) => string;
/**
 * Estimates reading time in minutes based on word count.
 * Average reading speed: 200 words per minute.
 */
export declare const calculateReadTime: (content: string) => number;
/**
 * Strips HTML tags from a string for plain text excerpts.
 */
export declare const stripHtml: (html: string) => string;
/**
 * Generates a short excerpt from content.
 */
export declare const generateExcerpt: (content: string, maxLength?: number) => string;
//# sourceMappingURL=helpers.d.ts.map
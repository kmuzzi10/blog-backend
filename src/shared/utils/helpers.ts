import slugify from 'slugify';

/**
 * Generates a URL-friendly slug from a title.
 * Appends a short random suffix to reduce collision chance.
 */
export const generateSlug = (title: string, withSuffix: boolean = false): string => {
  const base = slugify(title, {
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

/**
 * Estimates reading time in minutes based on word count.
 * Average reading speed: 200 words per minute.
 */
export const calculateReadTime = (content: string): number => {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Strips HTML tags from a string for plain text excerpts.
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Generates a short excerpt from content.
 */
export const generateExcerpt = (content: string, maxLength: number = 160): string => {
  const stripped = stripHtml(content);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength).trim() + '...';
};

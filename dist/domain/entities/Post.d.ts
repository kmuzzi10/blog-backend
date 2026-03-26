export declare enum PostStatus {
    DRAFT = "Draft",
    PUBLISHED = "Published",
    ARCHIVED = "Archived",
    DELETED_BY_ADMIN = "Deleted by Admin"
}
export interface IPost {
    _id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    featuredVideo?: string;
    status: PostStatus;
    authorId: string;
    categoryId?: string;
    tags: string[];
    readTime?: number;
    viewCount?: number;
    commentCount?: number;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IPostPublic extends IPost {
    _id: string;
    author?: {
        _id: string;
        name: string;
        avatar?: string;
        bio?: string;
    };
    category?: {
        _id: string;
        name: string;
        slug: string;
    };
    comments?: any[];
}
//# sourceMappingURL=Post.d.ts.map
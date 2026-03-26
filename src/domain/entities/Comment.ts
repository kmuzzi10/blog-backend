export interface IComment {
  _id?: string;
  postId: string;
  authorId: string;
  content: string;
  isApproved: boolean;
  parentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

import { Document, Model } from 'mongoose';
import { IComment } from '../../../domain/entities/Comment';
export interface ICommentDocument extends Omit<IComment, '_id'>, Document {
}
export declare const CommentModel: Model<ICommentDocument>;
//# sourceMappingURL=CommentModel.d.ts.map
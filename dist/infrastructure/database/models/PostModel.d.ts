import { Document, Model } from 'mongoose';
import { IPost } from '../../../domain/entities/Post';
export interface IPostDocument extends Omit<IPost, '_id'>, Document {
}
export declare const PostModel: Model<IPostDocument>;
//# sourceMappingURL=PostModel.d.ts.map
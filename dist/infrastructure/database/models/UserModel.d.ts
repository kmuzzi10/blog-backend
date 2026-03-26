import { Document, Model } from 'mongoose';
import { IUser } from '../../../domain/entities/User';
export interface IUserDocument extends Omit<IUser, '_id'>, Document {
}
export declare const UserModel: Model<IUserDocument>;
//# sourceMappingURL=UserModel.d.ts.map
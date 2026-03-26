import { Document, Model } from 'mongoose';
import { ICategory } from '../../../domain/entities/Category';
export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {
}
export declare const CategoryModel: Model<ICategoryDocument>;
//# sourceMappingURL=CategoryModel.d.ts.map
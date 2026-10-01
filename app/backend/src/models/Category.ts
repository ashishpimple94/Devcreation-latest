import { Schema, model, type Document, type Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: Types.ObjectId | null;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    // Self-reference supports categories + subcategories.
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    image: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Category = model<ICategory>('Category', categorySchema);

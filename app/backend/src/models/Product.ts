import { Schema, model, type Document, type Types } from 'mongoose';

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface IProductVariant {
  name: string; // e.g. "50g", "Gift Box"
  sku: string;
  price: number;
  stock: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  type: string; // "Wax Melts", "Aroma Stones" ...
  fragrance: string;
  description: string;
  category?: Types.ObjectId | null;
  price: number;
  compareAtPrice?: number; // original price for showing a discount
  discountPercent: number;
  weight?: string;
  stock: number;
  images: IProductImage[];
  variants: IProductVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const variantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, required: true, trim: true },
    fragrance: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    weight: { type: String },
    stock: { type: Number, required: true, min: 0, default: 0, index: true },
    images: { type: [imageSchema], default: [] },
    variants: { type: [variantSchema], default: [] },
    tags: { type: [String], default: [], index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// Full-text search across the fields customers actually search on.
productSchema.index({ name: 'text', description: 'text', fragrance: 'text', tags: 'text' });
// Common compound sort/filter: active products by newest.
productSchema.index({ isActive: 1, createdAt: -1 });

export const Product = model<IProduct>('Product', productSchema);

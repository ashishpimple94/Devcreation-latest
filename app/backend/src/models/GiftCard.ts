import { Schema, model, type Document } from 'mongoose';

export interface IGiftCard extends Document {
  code: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const giftCardSchema = new Schema<IGiftCard>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const GiftCard = model<IGiftCard>('GiftCard', giftCardSchema);

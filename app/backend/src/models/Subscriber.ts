import { Schema, model, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  discountCode: string;
  discountPercent: number;
  source: string;
  isActive: boolean;
  welcomeEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    discountCode: {
      type: String,
      default: 'WELCOME10',
    },
    discountPercent: {
      type: Number,
      default: 10,
    },
    source: {
      type: String,
      default: 'footer_circle',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    welcomeEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Subscriber = model<ISubscriber>('Subscriber', subscriberSchema);

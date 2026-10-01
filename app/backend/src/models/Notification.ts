import { Schema, model, type Document, type Types } from 'mongoose';
import { NOTIFICATION_TYPE, type NotificationType } from '@/constants';

export interface INotification extends Document {
  _id: Types.ObjectId;
  // Target user. `null` = broadcast to all staff (admin notifications).
  user: Types.ObjectId | null;
  forStaff: boolean;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: {
    kind: 'order' | 'product' | 'user';
    id: Types.ObjectId;
    ref?: string; // e.g. order number
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    forStaff: { type: Boolean, default: false, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedEntity: {
      kind: { type: String, enum: ['order', 'product', 'user'] },
      id: { type: Schema.Types.ObjectId },
      ref: { type: String },
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ forStaff: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);

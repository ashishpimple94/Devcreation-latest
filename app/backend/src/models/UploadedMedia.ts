import { Schema, model, type Document } from 'mongoose';

export interface IUploadedMedia extends Document {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const uploadedMediaSchema = new Schema<IUploadedMedia>(
  {
    key: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, required: true, default: 'image/jpeg' },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export const UploadedMedia = model<IUploadedMedia>('UploadedMedia', uploadedMediaSchema);

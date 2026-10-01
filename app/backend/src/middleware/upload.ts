import multer from 'multer';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/**
 * In-memory multer instance for image uploads. Files are validated for type and
 * size, then handed to the storage service (which writes to disk/S3). Keeping
 * them in memory avoids temp-file cleanup and lets the storage driver decide
 * where bytes ultimately land.
 */
export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest('Only JPG, PNG, WEBP, AVIF or GIF images are allowed'));
    }
    cb(null, true);
  },
});

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Request } from 'express';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';
import { UploadedMedia } from '@/models/UploadedMedia';
import { logger } from '@/utils/logger';

/**
 * Pluggable object-storage abstraction with MongoDB Atlas persistence.
 * Binary data is persisted to MongoDB Atlas so images survive ephemeral container
 * restarts (e.g. Render redeployments and free-tier spin-downs) while local disk
 * acts as a high-speed cache.
 */
export interface StoredFile {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export const storageService = {
  get uploadRoot() {
    return uploadRoot;
  },

  async save(file: Express.Multer.File, req?: Request): Promise<StoredFile> {
    if (env.STORAGE_DRIVER !== 'local') {
      throw ApiError.internal(`Storage driver "${env.STORAGE_DRIVER}" is not configured`);
    }

    const ext = path.extname(file.originalname) || '.bin';
    const key = `products/${crypto.randomUUID()}${ext}`;
    const dest = path.join(uploadRoot, key);

    // 1. Write to local disk cache
    try {
      await ensureDir(path.dirname(dest));
      await fs.writeFile(dest, file.buffer);
    } catch (diskErr) {
      logger.warn('Disk cache write failed, falling back to MongoDB only', { err: (diskErr as Error).message });
    }

    // 2. Persist permanently to MongoDB Atlas so Render redeploy never deletes images!
    try {
      await UploadedMedia.create({
        key,
        originalName: file.originalname,
        mimeType: file.mimetype || 'image/jpeg',
        size: file.size,
        data: file.buffer,
      });
      logger.info('Image permanently persisted to MongoDB Atlas', { key, size: file.size });
    } catch (dbErr) {
      logger.error('Failed to persist media in MongoDB Atlas', { key, err: (dbErr as Error).message });
    }

    let base = env.PUBLIC_ASSET_BASE;
    if (req) {
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto') || 'https';
      if (forwardedHost) {
        base = `${forwardedProto}://${forwardedHost}`;
      } else if (req.get('host')) {
        const proto = req.secure || req.protocol === 'https' ? 'https' : req.protocol;
        base = `${proto}://${req.get('host')}`;
      }
    }

    if ((!base || base.includes('localhost:4000')) && (process.env.RENDER || process.env.NODE_ENV === 'production')) {
      base = 'https://lightseagreen-donkey-692988.hostingersite.com';
    }

    return {
      url: `${base.replace(/\/+$/, '')}/uploads/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  },

  async findMedia(key: string) {
    const cleanKey = key.replace(/^\/+/, '');
    return UploadedMedia.findOne({
      $or: [
        { key: cleanKey },
        { key: `products/${cleanKey}` },
        { key: cleanKey.replace(/^products\//, '') },
      ],
    });
  },
};

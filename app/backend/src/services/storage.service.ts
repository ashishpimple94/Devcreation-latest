import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '@/config/env';
import { ApiError } from '@/utils/ApiError';

/**
 * Pluggable object-storage abstraction. Only the resulting public URL and
 * metadata are ever persisted in MongoDB — never the binary itself.
 *
 * The `local` driver writes to disk and is intended for development. In
 * production set STORAGE_DRIVER=s3 (or cloudinary) and implement the upload in
 * the corresponding branch; the rest of the app is unaffected because it only
 * consumes the returned URL.
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

import type { Request } from 'express';

export const storageService = {
  get uploadRoot() {
    return uploadRoot;
  },

  async save(file: Express.Multer.File, req?: Request): Promise<StoredFile> {
    if (env.STORAGE_DRIVER !== 'local') {
      // Extension point: upload `file.buffer` to S3/Cloudinary and return the CDN URL.
      throw ApiError.internal(`Storage driver "${env.STORAGE_DRIVER}" is not configured`);
    }

    const ext = path.extname(file.originalname) || '.bin';
    const key = `products/${crypto.randomUUID()}${ext}`;
    const dest = path.join(uploadRoot, key);
    await ensureDir(path.dirname(dest));
    await fs.writeFile(dest, file.buffer);

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
      base = 'https://devcreation1.onrender.com';
    }

    return {
      url: `${base.replace(/\/+$/, '')}/uploads/${key}`,
      key,
      size: file.size,
      mimeType: file.mimetype,
    };
  },
};

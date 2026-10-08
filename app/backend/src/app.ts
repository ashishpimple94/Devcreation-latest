import path from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { apiLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFound } from '@/middleware/error';
import { corsOriginHandler } from '@/config/cors';
import routes from '@/routes';
import { storageService } from '@/services/storage.service';

/** Builds and configures the Express application (no listening here). */
export function createApp() {
  const app = express();

  // Trust first proxy hop (Hostinger reverse proxy / Cloudflare / Nginx / Load Balancer)
  // Required so req.ip and express-rate-limit read X-Forwarded-* headers correctly.
  app.set('trust proxy', 1);

  // Security headers. crossOriginResourcePolicy relaxed so the Next.js app can
  // load images served from /uploads during development.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const corsOptions: cors.CorsOptions = {
    origin: corsOriginHandler,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours preflight cache for fast mobile performance
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());

  // Neutralise MongoDB operator injection ($, .) in user input.
  app.use(mongoSanitize());

  // Request logging via winston.
  app.use(
    morgan(env.isProd ? 'combined' : 'dev', {
      stream: { write: (msg) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    }),
  );

  // Serve locally stored uploads (disk cache).
  app.use('/uploads', express.static(path.join(storageService.uploadRoot)));

  // Fallback for uploads: restore from MongoDB Atlas if disk was reset on Render redeploy
  app.get('/uploads/*', async (req, res, next) => {
    try {
      const rawKey = (req.params as Record<string, string>)[0] || (req.params as any)[0] || '';
      const media = await storageService.findMedia(rawKey);
      if (!media) return next();

      // Write back to local disk cache for fast future hits
      const dest = path.join(storageService.uploadRoot, media.key);
      await fs.mkdir(path.dirname(dest), { recursive: true }).catch(() => {});
      await fs.writeFile(dest, media.data).catch(() => {});

      res.setHeader('Content-Type', media.mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(media.data);
    } catch (err) {
      return next(err);
    }
  });

  // Direct health check endpoints (bypass rate limiter for uptime monitoring & frontend checks)
  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
  });
  app.get(`${env.API_PREFIX}/health`, (_req, res) => {
    res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } });
  });

  app.use(env.API_PREFIX, apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

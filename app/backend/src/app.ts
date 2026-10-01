import path from 'node:path';
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
import routes from '@/routes';
import { storageService } from '@/services/storage.service';

/** Builds and configures the Express application (no listening here). */
export function createApp() {
  const app = express();

  // Security headers. crossOriginResourcePolicy relaxed so the Next.js app can
  // load images served from /uploads during development.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );

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

  // Serve locally stored uploads (dev image storage driver).
  app.use('/uploads', express.static(path.join(storageService.uploadRoot)));

  app.use(env.API_PREFIX, apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

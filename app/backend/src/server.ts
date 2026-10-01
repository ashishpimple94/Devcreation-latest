import { createServer } from 'node:http';
import { createApp } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { connectDatabase, disconnectDatabase } from '@/config/db';
import { connectRedis, disconnectRedis } from '@/config/redis';
import { initSocket } from '@/sockets/io';
import { startEventSubscriber } from '@/events/subscriber';
import { verifyMailer } from '@/config/mailer';
import { initRateLimiters } from '@/middleware/rateLimiter';
import { giftCardService } from '@/services/giftCard.service';

async function bootstrap() {
  await connectDatabase();
  await giftCardService.seedDefaults().catch((err) => {
    logger.warn('Failed to seed default gift cards', { err: (err as Error).message });
  });

  // Redis is optional — the app runs in a degraded (single-instance) mode if
  // it cannot be reached, so this never throws.
  await connectRedis();

  // Verify email transport (logs whether SMTP is configured or in log mode).
  await verifyMailer();

  // Build rate limiters now that Redis availability is known (avoids creating
  // them inside a request handler).
  initRateLimiters();

  const app = createApp();
  const httpServer = createServer(app);

  // Real-time layer: Socket.IO + (optional) Redis Pub/Sub fan-out.
  initSocket(httpServer);
  await startEventSubscriber();

  httpServer.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    httpServer.close();
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', { err: (err as Error).message, stack: (err as Error).stack });
  process.exit(1);
});

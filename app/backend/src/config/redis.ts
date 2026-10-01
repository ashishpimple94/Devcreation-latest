import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Redis is used for caching, rate limiting and Pub/Sub. It is treated as an
 * OPTIONAL accelerator: if it cannot be reached the app still runs on MongoDB
 * alone (cache becomes a pass-through, rate limiting falls back to in-memory,
 * and Pub/Sub degrades to a direct in-process Socket.IO emit).
 *
 * Three clients are used because a subscribed connection cannot issue normal
 * commands:
 *  - `redis`      general commands + caching
 *  - `publisher`  publishing Pub/Sub events
 *  - `subscriber` subscribing to Pub/Sub events
 */

/** Flipped to true once any client reports it cannot connect. */
export const redisState = { available: true };

function createClient(role: string): Redis {
  const client = new Redis(env.REDIS_URL, {
    // Fail fast and stop retrying so a missing Redis does not spam logs or
    // hang requests. Commands issued while offline reject quickly and callers
    // fall back to MongoDB.
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: () => null,
    reconnectOnError: () => false,
  });

  client.on('connect', () => {
    redisState.available = true;
    logger.info(`Redis connected (${role})`);
  });
  client.on('error', (err) => {
    if (redisState.available) {
      logger.warn(`Redis unavailable (${role}) — continuing without it`, { err: err.message });
    }
    redisState.available = false;
  });
  client.on('end', () => {
    redisState.available = false;
  });

  return client;
}

export const redis = createClient('main');
export const publisher = createClient('publisher');
export const subscriber = createClient('subscriber');

/**
 * Attempts to connect all clients once. Never throws — on failure the app runs
 * in the degraded (no-Redis) mode described above.
 */
export async function connectRedis(): Promise<boolean> {
  try {
    await Promise.all([redis.connect(), publisher.connect(), subscriber.connect()]);
    redisState.available = true;
    return true;
  } catch (err) {
    redisState.available = false;
    logger.warn('Starting without Redis — caching, rate limiting and Pub/Sub run in degraded mode', {
      err: (err as Error).message,
    });
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  await Promise.allSettled([redis.quit(), publisher.quit(), subscriber.quit()]);
}

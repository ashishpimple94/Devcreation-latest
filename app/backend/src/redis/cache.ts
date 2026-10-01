import { redis, redisState } from '@/config/redis';
import { logger } from '@/utils/logger';

/**
 * Thin cache-aside helper over Redis. When Redis is unavailable every method
 * becomes a no-op / pass-through so callers transparently fall back to the
 * source of truth (MongoDB) — Redis is an accelerator, not the database.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redisState.available) return null;
    try {
      const raw = await redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.warn('cache.get failed', { key, err: (err as Error).message });
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redisState.available) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn('cache.set failed', { key, err: (err as Error).message });
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (!redisState.available || !keys.length) return;
    try {
      await redis.del(...keys);
    } catch (err) {
      logger.warn('cache.del failed', { keys, err: (err as Error).message });
    }
  },

  /** Deletes all keys matching a glob pattern using a non-blocking SCAN. */
  async delByPattern(pattern: string): Promise<void> {
    if (!redisState.available) return;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = next;
        if (keys.length) await redis.del(...keys);
      } while (cursor !== '0');
    } catch (err) {
      logger.warn('cache.delByPattern failed', { pattern, err: (err as Error).message });
    }
  },

  /** Cache-aside: return cached value or compute, store and return it. */
  async remember<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await producer();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  },
};

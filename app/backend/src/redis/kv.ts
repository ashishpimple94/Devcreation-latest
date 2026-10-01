import { redis, redisState } from '@/config/redis';

/**
 * Small TTL key-value store used for short-lived tokens (e.g. password reset).
 * Uses Redis when available, otherwise an in-process map with expiry. The
 * in-memory fallback is per-instance and non-durable, which is acceptable for
 * dev / single-instance use where Redis is not running.
 */
const memory = new Map<string, { value: string; expiresAt: number }>();

function sweep() {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
}

export const kv = {
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (redisState.available) {
      try {
        await redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        /* fall through to memory */
      }
    }
    memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async get(key: string): Promise<string | null> {
    if (redisState.available) {
      try {
        return await redis.get(key);
      } catch {
        /* fall through to memory */
      }
    }
    sweep();
    const entry = memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memory.delete(key);
      return null;
    }
    return entry.value;
  },

  async del(key: string): Promise<void> {
    if (redisState.available) {
      try {
        await redis.del(key);
        return;
      } catch {
        /* fall through to memory */
      }
    }
    memory.delete(key);
  },
};

import type { RequestHandler } from 'express';
import rateLimit, { type Store } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, redisState } from '@/config/redis';
import { env } from '@/config/env';

/**
 * Distributed rate limiter backed by Redis so limits hold across multiple API
 * instances. If Redis is unavailable at startup it falls back to the default
 * in-memory store (per-instance limiting), so the app still runs.
 */
function makeLimiter(options: { windowMs: number; max: number; prefix: string }) {
  let store: Store | undefined;
  if (redisState.available) {
    store = new RedisStore({
      prefix: `rl:${options.prefix}:`,
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<never>,
    });
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
      error: null,
    },
  });
}

/**
 * Limiters are created once at module load (not per-request, which
 * express-rate-limit forbids). `initRateLimiters()` is called after the Redis
 * connection attempt so the store choice reflects Redis availability; if a
 * request arrives before init, a limiter is built on demand as a fallback.
 */
let _apiLimiter: RequestHandler | null = null;
let _authLimiter: RequestHandler | null = null;

export function initRateLimiters(): void {
  _apiLimiter = makeLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, prefix: 'api' });
  _authLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 20, prefix: 'auth' });
}

export const apiLimiter: RequestHandler = (req, res, next) => {
  if (!_apiLimiter) _apiLimiter = makeLimiter({ windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX, prefix: 'api' });
  return _apiLimiter(req, res, next);
};

export const authLimiter: RequestHandler = (req, res, next) => {
  if (!_authLimiter) _authLimiter = makeLimiter({ windowMs: 15 * 60 * 1000, max: 20, prefix: 'auth' });
  return _authLimiter(req, res, next);
};

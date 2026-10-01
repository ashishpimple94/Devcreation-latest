import { subscriber, redisState } from '@/config/redis';
import { REDIS_CHANNELS } from '@/constants';
import { dispatchToSockets } from '@/events/dispatch';
import { logger } from '@/utils/logger';
import type { DomainEvent } from '@/events/types';

/**
 * Subscribes to the Redis events channel and fans each event out over
 * Socket.IO. Skipped when Redis is unavailable — in that mode the publisher
 * dispatches to sockets directly (single-instance fallback).
 */
export async function startEventSubscriber(): Promise<void> {
  if (!redisState.available) {
    logger.info('Skipping Redis subscriber — running in single-instance real-time mode');
    return;
  }

  try {
    await subscriber.subscribe(REDIS_CHANNELS.EVENTS);
  } catch (err) {
    logger.warn('Could not subscribe to Redis events', { err: (err as Error).message });
    return;
  }

  subscriber.on('message', (channel, raw) => {
    if (channel !== REDIS_CHANNELS.EVENTS) return;
    try {
      dispatchToSockets(JSON.parse(raw) as DomainEvent);
    } catch {
      /* ignore malformed payloads */
    }
  });

  logger.info('Redis event subscriber started');
}

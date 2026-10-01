import { publisher, redisState } from '@/config/redis';
import { REDIS_CHANNELS } from '@/constants';
import { logger } from '@/utils/logger';
import { dispatchToSockets } from '@/events/dispatch';
import type { DomainEvent } from '@/events/types';

/**
 * Publishes a domain event. When Redis is available it goes through Pub/Sub so
 * every API instance fans it out to its sockets. When Redis is unavailable it
 * is dispatched directly to this instance's sockets — real-time still works for
 * a single-instance deployment.
 */
export async function publishEvent(event: Omit<DomainEvent, 'createdAt'>): Promise<void> {
  const payload: DomainEvent = { ...event, createdAt: new Date().toISOString() };

  if (!redisState.available) {
    try {
      dispatchToSockets(payload);
    } catch (err) {
      logger.warn('In-process event dispatch failed', { err: (err as Error).message });
    }
    return;
  }

  try {
    await publisher.publish(REDIS_CHANNELS.EVENTS, JSON.stringify(payload));
  } catch (err) {
    // Redis dropped mid-flight — fall back to a direct emit so the event is not lost.
    logger.warn('Publish failed, dispatching in-process', { err: (err as Error).message });
    try {
      dispatchToSockets(payload);
    } catch {
      /* best effort */
    }
  }
}

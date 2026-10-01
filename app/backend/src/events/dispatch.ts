import { SOCKET_EVENTS, SOCKET_ROOMS } from '@/constants';
import { getIO } from '@/sockets/io';
import type { DomainEvent } from '@/events/types';

/**
 * Fans a domain event out over Socket.IO:
 *   - to the target customer's room (order updates, customer notifications)
 *   - to the shared admin room (admin notifications)
 *   - a dashboard-refresh nudge when stats changed
 *
 * Called by the Redis subscriber (multi-instance) or directly by the publisher
 * when Redis is unavailable (single-instance fallback).
 */
export function dispatchToSockets(event: DomainEvent): void {
  const io = getIO();

  if (event.targetUserId) {
    io.to(SOCKET_ROOMS.user(event.targetUserId)).emit(SOCKET_EVENTS.CUSTOMER_NOTIFICATION, event);
    if (event.relatedEntity?.kind === 'order') {
      io.to(SOCKET_ROOMS.user(event.targetUserId)).emit(SOCKET_EVENTS.ORDER_UPDATED, event);
    }
  }

  if (event.toStaff) {
    io.to(SOCKET_ROOMS.admins).emit(SOCKET_EVENTS.ADMIN_NOTIFICATION, event);
  }

  if (event.dashboardDirty) {
    io.to(SOCKET_ROOMS.admins).emit(SOCKET_EVENTS.ADMIN_DASHBOARD_UPDATE, { at: event.createdAt });
  }
}

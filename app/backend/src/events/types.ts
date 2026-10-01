import type { NotificationType } from '@/constants';

/**
 * The single event shape published to Redis Pub/Sub and, from there, fanned out
 * over Socket.IO. Keeping one envelope makes the subscriber trivial to route.
 */
export interface DomainEvent {
  type: NotificationType;
  title: string;
  message: string;
  /** Target a specific customer's socket room. */
  targetUserId?: string | null;
  /** Also deliver to the staff/admin room. */
  toStaff?: boolean;
  relatedEntity?: {
    kind: 'order' | 'product' | 'user';
    id: string;
    ref?: string;
  };
  /** Signals admin dashboards to refetch their stats. */
  dashboardDirty?: boolean;
  createdAt: string;
}

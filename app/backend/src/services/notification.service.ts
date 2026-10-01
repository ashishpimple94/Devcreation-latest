import { Types } from 'mongoose';
import { Notification } from '@/models/Notification';
import { publishEvent } from '@/events/publisher';
import { getPageParams, buildPageMeta } from '@/utils/pagination';
import type { NotificationType } from '@/constants';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string | null;
  forStaff?: boolean;
  relatedEntity?: { kind: 'order' | 'product' | 'user'; id: string; ref?: string };
  dashboardDirty?: boolean;
}

/**
 * Persists notification records (source of truth) then publishes a single
 * domain event to Redis so connected clients update in real time. A staff
 * notification is stored once with `forStaff: true` and broadcast to the admin
 * room rather than duplicated per admin.
 */
export const notificationService = {
  async create(input: CreateNotificationInput) {
    const docs: Array<Record<string, unknown>> = [];

    if (input.userId) {
      docs.push({
        user: new Types.ObjectId(input.userId),
        forStaff: false,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntity: input.relatedEntity
          ? { ...input.relatedEntity, id: new Types.ObjectId(input.relatedEntity.id) }
          : undefined,
      });
    }

    if (input.forStaff) {
      docs.push({
        user: null,
        forStaff: true,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntity: input.relatedEntity
          ? { ...input.relatedEntity, id: new Types.ObjectId(input.relatedEntity.id) }
          : undefined,
      });
    }

    if (docs.length) await Notification.insertMany(docs);

    await publishEvent({
      type: input.type,
      title: input.title,
      message: input.message,
      targetUserId: input.userId ?? null,
      toStaff: Boolean(input.forStaff),
      relatedEntity: input.relatedEntity,
      dashboardDirty: input.dashboardDirty,
    });
  },

  async listForUser(userId: string, role: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPageParams(query);
    const isStaff = role !== 'customer';
    const filter = isStaff
      ? { $or: [{ user: new Types.ObjectId(userId) }, { forStaff: true }] }
      : { user: new Types.ObjectId(userId) };

    const [items, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return { items, unread, meta: buildPageMeta(total, page, limit) };
  },

  async markRead(userId: string, role: string, id: string) {
    const isStaff = role !== 'customer';
    const filter = isStaff
      ? { _id: id, $or: [{ user: new Types.ObjectId(userId) }, { forStaff: true }] }
      : { _id: id, user: new Types.ObjectId(userId) };
    await Notification.updateOne(filter, { $set: { isRead: true } });
  },

  async markAllRead(userId: string, role: string) {
    const isStaff = role !== 'customer';
    const filter = isStaff
      ? { $or: [{ user: new Types.ObjectId(userId) }, { forStaff: true }] }
      : { user: new Types.ObjectId(userId) };
    await Notification.updateMany({ ...filter, isRead: false }, { $set: { isRead: true } });
  },
};

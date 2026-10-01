'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { EmptyState, Skeleton } from '@/components/ui';
import { timeAgo, cn } from '@/lib/utils';
import type { NotificationType } from '@/types';

const TYPE_LABEL: Record<NotificationType, string> = {
  new_order: 'New Order',
  order_status: 'Order Status',
  payment_received: 'Payment',
  order_cancelled: 'Cancelled',
  low_stock: 'Low Stock',
  product_created: 'Product',
  product_updated: 'Product',
  customer_registered: 'Customer',
};

export default function AdminNotificationsPage() {
  const { items, unread, loading, refresh, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink">Notifications</h1>
        {unread > 0 && (
          <button onClick={() => markAllRead()} className="font-util text-[0.62rem] uppercase tracking-[0.12em] text-gold hover:text-gold-dk">
            Mark all read
          </button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No notifications yet" hint="New orders, payments and low-stock alerts appear here in real time." />
      ) : (
        <div className="divide-y divide-line-soft rounded-xl border border-line bg-white shadow-sm">
          {items.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={cn('flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2', !n.isRead && 'bg-[rgba(184,148,63,.05)]')}
            >
              <span className="mt-0.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 font-util text-[0.5rem] uppercase tracking-[0.1em] text-copper">
                {TYPE_LABEL[n.type]}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{n.title}</span>
                  <span className="whitespace-nowrap font-util text-[0.55rem] text-ink-3">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-body">{n.message}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

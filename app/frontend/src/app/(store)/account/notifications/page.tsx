'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { EmptyState, Skeleton } from '@/components/ui';
import { timeAgo, cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { items, unread, loading, refresh, markRead, markAllRead } = useNotificationStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink">Notifications</h1>
        {unread > 0 && (
          <button onClick={() => markAllRead()} className="font-util text-[0.62rem] uppercase tracking-[0.12em] text-gold hover:text-gold-dk">
            Mark all read
          </button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No notifications yet" hint="Order updates and offers will show up here." />
      ) : (
        <div className="divide-y divide-line-soft rounded-[10px] border border-line bg-surface">
          {items.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={cn('flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-surface-2', !n.isRead && 'bg-[rgba(184,148,63,.05)]')}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display-alt text-lg text-ink">{n.title}</span>
                <span className="whitespace-nowrap font-util text-[0.55rem] text-ink-3">{timeAgo(n.createdAt)}</span>
              </div>
              <span className="text-sm text-body">{n.message}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

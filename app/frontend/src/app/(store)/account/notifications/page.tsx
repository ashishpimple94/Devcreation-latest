'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { Skeleton } from '@/components/ui';
import { timeAgo, cn } from '@/lib/utils';

const TYPE_ICON: Record<string, { icon: string; color: string }> = {
  new_order:          { icon: '🛍️', color: 'bg-blue-50 text-blue-600' },
  order_status:       { icon: '📦', color: 'bg-amber-50 text-amber-600' },
  payment_received:   { icon: '💳', color: 'bg-emerald-50 text-emerald-600' },
  order_cancelled:    { icon: '✕',  color: 'bg-red-50 text-red-500' },
  low_stock:          { icon: '⚠️', color: 'bg-orange-50 text-orange-600' },
  product_created:    { icon: '✨', color: 'bg-gold/10 text-gold-dk' },
  product_updated:    { icon: '✏️', color: 'bg-surface-2 text-ink-3' },
  customer_registered:{ icon: '👋', color: 'bg-indigo-50 text-indigo-600' },
};

export default function NotificationsPage() {
  const { items, unread, loading, refresh, markRead, markAllRead } = useNotificationStore();

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-dk">Account</p>
          <h1 className="font-display text-3xl font-medium text-ink">
            Notifications
            {unread > 0 && (
              <span className="ml-3 rounded-full bg-gold/15 px-2.5 py-0.5 font-util text-[0.7rem] font-bold text-gold-dk align-middle">
                {unread} new
              </span>
            )}
          </h1>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/8 px-4 py-2 font-util text-xs font-bold uppercase tracking-wider text-gold-dk transition-all duration-200 hover:bg-gold hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-3xl">🔔</span>
          <div>
            <p className="font-display-alt text-xl font-medium text-ink">All caught up</p>
            <p className="mt-1 text-sm text-ink-3">Order updates and exclusive offers will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
          {items.map((n, idx) => {
            const meta = TYPE_ICON[n.type] ?? { icon: '🔔', color: 'bg-surface-2 text-ink-3' };
            return (
              <button
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={cn(
                  'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors duration-200',
                  idx !== items.length - 1 && 'border-b border-line-soft',
                  !n.isRead ? 'bg-[rgba(184,148,63,0.04)] hover:bg-[rgba(184,148,63,0.08)]' : 'hover:bg-surface-2',
                )}
              >
                {/* Icon bubble */}
                <span className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg', meta.color)}>
                  {meta.icon}
                </span>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn(
                      'font-display-alt text-[0.98rem] leading-snug text-ink',
                      !n.isRead && 'font-semibold',
                    )}>
                      {n.title}
                    </p>
                    <span className="shrink-0 font-util text-[0.52rem] text-ink-3 pt-0.5">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-[0.82rem] leading-relaxed text-body">{n.message}</p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      {items.length > 0 && (
        <p className="text-center font-util text-[0.58rem] uppercase tracking-wider text-ink-3">
          Dev Creation · Your order &amp; fragrance updates live here
        </p>
      )}
    </div>
  );
}

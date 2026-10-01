'use client';

import { useState } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { timeAgo, cn } from '@/lib/utils';

/** Header notification bell + dropdown panel for customers. */
export function NotificationBell({ unread }: { unread: number }) {
  const [open, setOpen] = useState(false);
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative p-1.5 text-ink-2 transition-colors hover:text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 font-util text-[0.52rem] font-semibold leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-10 z-[120] w-[min(360px,90vw)] rounded-[10px] border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="util-label">Notifications</span>
              {unread > 0 && (
                <button onClick={() => markAllRead()} className="font-util text-[0.58rem] uppercase tracking-[0.12em] text-gold hover:text-gold-dk">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-body">You&apos;re all caught up.</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={cn(
                      'flex w-full flex-col gap-1 border-b border-line-soft px-4 py-3 text-left transition-colors hover:bg-surface-2',
                      !n.isRead && 'bg-[rgba(184,148,63,.05)]',
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display-alt text-[0.98rem] text-ink">{n.title}</span>
                      <span className="whitespace-nowrap font-util text-[0.52rem] text-ink-3">{timeAgo(n.createdAt)}</span>
                    </span>
                    <span className="text-[0.82rem] leading-snug text-body">{n.message}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

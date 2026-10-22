'use client';

import { useEffect, useRef, useState } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { timeAgo, cn } from '@/lib/utils';

/** Header notification bell + animated dropdown panel for customers. */
export function NotificationBell({ unread }: { unread: number }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  /* Close on click-outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ease-spring active:scale-90',
          open
            ? 'bg-gold/15 text-gold-dk'
            : 'text-ink-2 hover:bg-gold/10 hover:text-gold-dk',
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'transition-transform duration-300 ease-spring',
            open && 'scale-110',
          )}
        >
          <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {unread > 0 && (
          <span
            key={unread}
            className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 font-util text-[0.52rem] font-semibold leading-none text-white shadow-xs animate-badge-pop"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="animate-dropdown-in absolute right-0 top-[calc(100%+8px)] z-[120] w-[min(380px,90vw)] origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-2">
                Notifications
              </span>
              {unread > 0 && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 font-util text-[0.6rem] font-bold text-gold-dk">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="rounded-lg px-2 py-1 font-util text-[0.58rem] uppercase tracking-[0.12em] text-gold transition-all duration-200 hover:bg-gold/10 hover:text-gold-dk"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[62vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-ink-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                </span>
                <p className="text-sm text-ink-2 font-medium">You&apos;re all caught up</p>
                <p className="text-xs text-ink-3">No new notifications right now.</p>
              </div>
            ) : (
              items.map((n, idx) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={cn(
                    'group/notif flex w-full flex-col gap-1 border-b border-line-soft px-4 py-3.5 text-left transition-colors duration-200',
                    idx === 0 && 'rounded-none',
                    !n.isRead
                      ? 'bg-[rgba(184,148,63,.05)] hover:bg-[rgba(184,148,63,.1)]'
                      : 'hover:bg-surface-2',
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                      {!n.isRead && (
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      )}
                      <span className="font-display-alt text-[0.98rem] font-medium text-ink leading-snug">
                        {n.title}
                      </span>
                    </span>
                    <span className="whitespace-nowrap font-util text-[0.52rem] text-ink-3 pt-0.5 shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  <span className="text-[0.82rem] leading-relaxed text-body pl-3">
                    {n.message}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-line-soft px-4 py-3">
              <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3">
                Dev Creation · Order & Fragrance Updates
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

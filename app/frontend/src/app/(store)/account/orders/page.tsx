'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ErrorState, Skeleton } from '@/components/ui';
import { formatDate, formatRupee, cn } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_ICON: Record<string, string> = {
  pending: '⏳', confirmed: '✅', processing: '⚙️',
  shipped: '🚚', delivered: '📦', cancelled: '✕', refunded: '↩',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const load = () => {
    setLoading(true);
    setError(null);
    orderService
      .listMine()
      .then((res) => setOrders(res.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const statuses = ['all', ...Array.from(new Set(orders.map((o) => o.status)))];
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-dk">Account</p>
          <h1 className="font-display text-3xl font-medium text-ink">My Orders</h1>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/8 px-4 py-2 font-util text-xs font-bold uppercase tracking-wider text-gold-dk transition-all duration-200 hover:bg-gold hover:text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          Shop Again
        </Link>
      </div>

      {/* Filter chips */}
      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn(
                'rounded-full px-3.5 py-1.5 font-util text-[0.62rem] font-semibold uppercase tracking-wider transition-all duration-200',
                filter === s
                  ? 'bg-deep text-white shadow-xs'
                  : 'border border-line bg-surface text-ink-3 hover:border-gold/50 hover:text-ink',
              )}
            >
              {s === 'all' ? `All (${orders.length})` : `${STATUS_ICON[s] ?? ''} ${s}`}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-3xl">📦</span>
          <div>
            <p className="font-display-alt text-xl font-medium text-ink">No orders yet</p>
            <p className="mt-1 text-sm text-ink-3">Place your first order to see it tracked here.</p>
          </div>
          <Link href="/products" className="btn-primary px-7 py-2.5 text-xs">Explore Collection</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line py-12 text-center">
          <p className="text-sm text-ink-3">No {filter} orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-card"
            >
              {/* Left: order info */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-lg transition-colors group-hover:bg-gold/10">
                  {STATUS_ICON[order.status] ?? '📋'}
                </div>
                <div>
                  <p className="font-util text-sm font-bold text-ink">#{order.orderNumber}</p>
                  <p className="mt-0.5 text-[0.72rem] text-ink-3">
                    {formatDate(order.createdAt)}
                    <span className="mx-1.5 opacity-30">·</span>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Right: status + amount */}
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-body text-base font-semibold tabular-nums text-ink">{formatRupee(order.total)}</span>
                <svg className="h-4 w-4 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

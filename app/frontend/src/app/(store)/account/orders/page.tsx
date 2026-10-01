'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { formatDate, formatRupee } from '@/lib/utils';
import type { Order } from '@/types';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">My orders</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" hint="When you place an order it will appear here." action={<Link href="/products" className="btn-primary mt-2">Shop</Link>} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-line bg-surface p-5 transition-colors hover:border-gold"
            >
              <div>
                <div className="font-util text-sm font-semibold text-ink">{order.orderNumber}</div>
                <div className="mt-1 text-xs text-ink-3">{formatDate(order.createdAt)} · {order.items.length} item(s)</div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="font-body text-sm font-semibold tabular-nums text-ink">{formatRupee(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

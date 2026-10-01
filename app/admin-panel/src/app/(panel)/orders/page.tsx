'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { useSocket } from '@/hooks/useSocket';
import { formatDate, formatRupee } from '@/lib/utils';
import type { Order, OrderStatus, PageMeta } from '@/types';

const STATUSES: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminService
      .listOrders({ page, limit: 10, search: debouncedSearch || undefined, status: status || undefined, sort })
      .then((res) => {
        setOrders(res.items);
        setMeta(res.meta);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status, sort]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debouncedSearch, status, sort]);

  // New orders arriving in real time refresh the list.
  useSocket({ onAdminNotification: load });

  const columns: Column<Order>[] = [
    { key: 'orderNumber', header: 'Order', render: (o) => <span className="font-util text-xs font-semibold text-ink">{o.orderNumber}</span> },
    { key: 'customer', header: 'Customer', render: (o) => (typeof o.user === 'object' ? o.user.name : '—') },
    {
      key: 'amount',
      header: 'Amount',
      render: (o) => (
        <div className="flex items-center gap-1.5">
          <span className="font-util text-xs">{formatRupee(o.total)}</span>
          {o.promoCode && (
            <span
              title={`Promo: ${o.promoCode} (-${formatRupee(o.discount ?? 0)})`}
              className="inline-block rounded bg-gold/15 px-1.5 py-0.5 font-mono text-[0.6rem] text-gold-dk font-semibold uppercase"
            >
              {o.promoCode}
            </span>
          )}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: '',
      render: (o) => (
        <button onClick={() => router.push(`/orders/${o._id}`)} className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-gold hover:text-gold-dk">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-medium text-ink">Orders</h1>
      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        error={error}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        emptyLabel="No orders match your filters"
        toolbar={
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number…"
              className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')} className="rounded-lg border border-line bg-white px-3 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] outline-none focus:border-gold">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] outline-none focus:border-gold">
              <option value="newest">Newest</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </>
        }
      />
    </div>
  );
}

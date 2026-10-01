'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { useSocket } from '@/hooks/useSocket';
import { formatDate, formatRupee, cn } from '@/lib/utils';
import type { Order, OrderStatus, PageMeta } from '@/types';

const STATUS_TABS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

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
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status, sort]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debouncedSearch, status, sort]);

  // Real-time notification updates
  useSocket({ onAdminNotification: load });

  // Compute summary stats from current view
  const totalAmount = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing' || o.status === 'confirmed').length;

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order Details',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-util text-xs font-bold text-ink hover:text-gold cursor-pointer" onClick={() => router.push(`/orders/${o._id}`)}>
            {o.orderNumber}
          </span>
          <span className="text-[0.72rem] text-ink-3">
            {formatDate(o.placedAt ?? o.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => {
        const customer = typeof o.user === 'object' && o.user ? o.user : null;
        const name = customer?.name || o.shippingAddress?.fullName || 'Guest Customer';
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 border border-line text-xs font-semibold text-gold-dk">
              {initials}
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-xs text-ink">{name}</span>
              <span className="text-[0.7rem] text-ink-3">
                {customer?.email || o.shippingAddress?.phone || '—'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'items',
      header: 'Items',
      render: (o) => {
        const firstItem = o.items[0];
        const extraCount = o.items.length - 1;
        return (
          <div className="flex items-center gap-2">
            {firstItem?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstItem.image}
                alt={firstItem.name}
                className="h-8 w-8 rounded-md border border-line object-cover bg-surface-2"
              />
            )}
            <div className="text-xs text-ink">
              <span className="line-clamp-1 font-medium">{firstItem?.name || 'Item'}</span>
              <span className="text-[0.68rem] text-ink-3">
                Qty: {firstItem?.quantity} {extraCount > 0 && `(+${extraCount} more)`}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'amount',
      header: 'Total & Payment',
      render: (o) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-body text-xs font-bold text-ink">{formatRupee(o.total)}</span>
            {o.promoCode && (
              <span
                title={`Promo: ${o.promoCode}`}
                className="rounded bg-gold/15 px-1.5 py-0.2 font-mono text-[0.58rem] font-bold text-gold-dk uppercase"
              >
                {o.promoCode}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <PaymentStatusBadge status={o.paymentStatus} />
            <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
              {o.paymentMethod || 'COD'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment Status',
      render: (o) => <OrderStatusBadge status={o.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (o) => (
        <button
          onClick={() => router.push(`/orders/${o._id}`)}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 font-util text-[0.65rem] font-bold uppercase tracking-wider text-ink transition-colors hover:border-gold hover:text-gold-dk"
        >
          <span>View</span>
          <span>→</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Summary KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Orders Management</h1>
          <p className="mt-1 text-xs text-ink-3">
            Track customer orders, update fulfillment statuses, and manage shipments.
          </p>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-xs">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">Total Displayed</span>
          <div className="mt-1 font-display text-2xl font-medium text-ink">{meta?.total ?? orders.length}</div>
          <span className="text-[0.68rem] text-ink-3">Orders in database</span>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-4 shadow-xs">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-amber-800">Pending Actions</span>
          <div className="mt-1 font-display text-2xl font-medium text-amber-900">{pendingCount}</div>
          <span className="text-[0.68rem] text-amber-700">Awaiting confirmation</span>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-50/50 p-4 shadow-xs">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-blue-800">In Fulfillment</span>
          <div className="mt-1 font-display text-2xl font-medium text-blue-900">{processingCount}</div>
          <span className="text-[0.68rem] text-blue-700">Confirmed or packing</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 shadow-xs">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-emerald-800">Page Value</span>
          <div className="mt-1 font-display text-2xl font-medium text-emerald-900">{formatRupee(totalAmount)}</div>
          <span className="text-[0.68rem] text-emerald-700">Sum of visible orders</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isSelected = status === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 font-util text-xs font-medium uppercase tracking-wider transition-all',
                isSelected
                  ? 'bg-deep text-white shadow-xs'
                  : 'bg-white text-ink-2 border border-line hover:border-gold hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Order Table */}
      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        error={error}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        emptyLabel="No orders found matching your search or filters"
        toolbar={
          <>
            <div className="relative min-w-[240px] flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order #, customer, or phone…"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm outline-none transition-colors focus:border-gold"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-line bg-white px-3.5 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] text-ink outline-none focus:border-gold"
            >
              <option value="newest">Newest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </>
        }
      />
    </div>
  );
}

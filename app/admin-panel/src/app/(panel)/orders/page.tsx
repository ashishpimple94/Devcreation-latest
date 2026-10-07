'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useSocket } from '@/hooks/useSocket';
import { formatDate, formatDateTime, formatRupee, cn, resolveImageUrl } from '@/lib/utils';
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

const ORDER_STEPS: { status: OrderStatus; label: string; stepNum: number }[] = [
  { status: 'pending', label: 'Placed', stepNum: 1 },
  { status: 'confirmed', label: 'Confirmed', stepNum: 2 },
  { status: 'processing', label: 'Packing', stepNum: 3 },
  { status: 'shipped', label: 'Shipped', stepNum: 4 },
  { status: 'delivered', label: 'Delivered', stepNum: 5 },
];

const ALL_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Order Details Pop-up Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('confirmed');
  const [statusNote, setStatusNote] = useState('');

  const debouncedSearch = useDebounce(search);

  // Initialize search from URL params if present (e.g. ?search=email or ?id=123)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);

    const orderId = searchParams.get('id') || searchParams.get('order');
    if (orderId) {
      setDetailLoading(true);
      adminService
        .getOrder(orderId)
        .then((ord) => {
          setSelectedOrder(ord);
          setNextStatus(ord.status);
        })
        .catch(() => {})
        .finally(() => setDetailLoading(false));
    }
  }, [searchParams]);

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

  const openOrderDetail = async (o: Order) => {
    setSelectedOrder(o);
    setNextStatus(o.status);
    setStatusNote('');
    setDetailLoading(true);
    try {
      const full = await adminService.getOrder(o._id);
      setSelectedOrder(full);
      setNextStatus(full.status);
    } catch {
      // keep basic order object if full fetch errors
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(selectedOrder._id, nextStatus, statusNote || undefined);
      setSelectedOrder(updated);
      success(`Order status changed to "${nextStatus.toUpperCase()}"`);
      setStatusNote('');
      load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setStatusUpdating(false);
    }
  };

  const copyShippingAddress = () => {
    if (!selectedOrder) return;
    const a = selectedOrder.shippingAddress;
    const text = `${a.fullName}\n${a.line1}${a.line2 ? `, ${a.line2}` : ''}\n${a.city}, ${a.state} - ${a.postalCode}\nPhone: ${a.phone}`;
    navigator.clipboard.writeText(text);
    success('Shipping address copied to clipboard');
  };

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
          <span
            className="font-util text-xs font-bold text-ink hover:text-gold cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              openOrderDetail(o);
            }}
          >
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
                src={resolveImageUrl(firstItem.image)}
                alt={firstItem.name}
                className="h-8 w-8 rounded-md border border-line object-cover bg-surface-2"
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                    el.src = '/assets/Logos/logo.jpeg';
                  }
                }}
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
          onClick={(e) => {
            e.stopPropagation();
            openOrderDetail(o);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 font-util text-[0.65rem] font-bold uppercase tracking-wider text-ink transition-colors hover:border-gold hover:text-gold-dk"
        >
          <span>View</span>
          <span>→</span>
        </button>
      ),
    },
  ];

  // Lifecycle calculations for selected order
  const currentStepIdx = selectedOrder
    ? ORDER_STEPS.findIndex((s) => s.status === selectedOrder.status)
    : -1;

  const customerObj =
    selectedOrder && typeof selectedOrder.user === 'object' && selectedOrder.user
      ? selectedOrder.user
      : null;

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

      {/* Main Order Table with Row Click Pop-up */}
      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        error={error}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        onRowClick={openOrderDetail}
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

      {/* Enhanced Order Detail Pop-up Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        className="max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold text-ink">{selectedOrder.orderNumber}</h2>
                  <OrderStatusBadge status={selectedOrder.status} />
                  <PaymentStatusBadge status={selectedOrder.paymentStatus} />
                </div>
                <p className="mt-1 text-xs text-ink-3">
                  Placed on {formatDateTime(selectedOrder.placedAt ?? selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-line p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* 5-Step Visual Lifecycle Timeline */}
            {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && (
              <div className="rounded-xl border border-line bg-surface-2 p-3.5">
                <div className="flex items-center justify-between">
                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = currentStepIdx >= idx;
                    return (
                      <div key={step.status} className="flex flex-1 flex-col items-center">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full font-util text-[0.62rem] font-bold transition-all',
                            isDone ? 'bg-gold text-white shadow-xs' : 'bg-surface-3 text-ink-3',
                          )}
                        >
                          {step.stepNum}
                        </div>
                        <span
                          className={cn(
                            'mt-1.5 font-util text-[0.55rem] uppercase tracking-wider',
                            isDone ? 'font-bold text-ink' : 'text-ink-3',
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Status Update Controls */}
            <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                Update Order Status
              </span>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink outline-none focus:border-gold"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Optional status note (e.g. Courier tracking #)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="min-w-[200px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-xs text-ink outline-none focus:border-gold"
                />

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={statusUpdating || nextStatus === selectedOrder.status}
                  className="rounded-lg bg-deep px-4 py-2 font-util text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-[#3D2A1E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusUpdating ? 'Updating…' : 'Save Status'}
                </button>
              </div>
            </div>

            {/* Itemized Order Breakdown */}
            <div className="rounded-xl border border-line bg-white p-4">
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="mt-3 divide-y divide-line-soft">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2.5">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveImageUrl(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                              el.src = '/assets/Logos/logo.jpeg';
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs">🕯️</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-display-alt text-base font-semibold text-ink">{item.name}</div>
                      <div className="text-xs text-ink-3">
                        {item.variantName ? <span className="text-gold-dk">{item.variantName} · </span> : ''}
                        Qty: <strong>{item.quantity}</strong>
                        {item.sku ? ` · SKU: ${item.sku}` : ''}
                      </div>
                    </div>
                    <div className="font-body text-sm font-semibold tabular-nums text-ink">
                      {formatRupee(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="mt-4 border-t border-line pt-3 text-xs space-y-1.5">
                <div className="flex justify-between text-ink-2">
                  <span className="font-util uppercase tracking-wider text-ink-3">Items total:</span>
                  <span className="font-semibold tabular-nums">{formatRupee(selectedOrder.itemsTotal || selectedOrder.total)}</span>
                </div>
                {selectedOrder.discount && selectedOrder.discount > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-util uppercase tracking-wider">
                      Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}:
                    </span>
                    <span className="font-semibold tabular-nums">-{formatRupee(selectedOrder.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-ink-2">
                  <span className="font-util uppercase tracking-wider text-ink-3">Shipping:</span>
                  <span className="font-semibold tabular-nums">
                    {selectedOrder.shippingFee ? formatRupee(selectedOrder.shippingFee) : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
                  <span className="font-display">Total Amount:</span>
                  <span className="font-display text-gold-dk tabular-nums">{formatRupee(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-surface-2/60 p-4 text-xs space-y-1.5">
                <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-2">
                  Customer Information
                </span>
                <div>
                  <strong className="text-ink">{customerObj?.name || selectedOrder.shippingAddress?.fullName}</strong>
                </div>
                <div className="text-ink-2">
                  Email: {customerObj?.email || '—'}
                </div>
                <div className="text-ink-2">
                  Phone: {selectedOrder.shippingAddress?.phone}
                </div>
                <div className="text-ink-3 pt-1">
                  Payment: <strong>{selectedOrder.paymentMethod?.toUpperCase()}</strong> ({selectedOrder.paymentStatus})
                </div>
              </div>

              <div className="rounded-xl border border-line bg-surface-2/60 p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                    Shipping Address
                  </span>
                  <button
                    type="button"
                    onClick={copyShippingAddress}
                    className="font-util text-[0.6rem] text-gold hover:underline uppercase tracking-wider"
                  >
                    Copy Address
                  </button>
                </div>
                <div className="text-ink-2 leading-relaxed">
                  <strong>{selectedOrder.shippingAddress?.fullName}</strong><br />
                  {selectedOrder.shippingAddress?.line1}
                  {selectedOrder.shippingAddress?.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}<br />
                  {selectedOrder.shippingAddress?.country || 'India'}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-line bg-white px-3 py-2 font-util text-xs uppercase tracking-wider text-ink-2 hover:bg-surface-2"
                >
                  🖨️ Print Invoice
                </button>
                <a
                  href={`mailto:${customerObj?.email || ''}?subject=Dev%20Creation%20Order%20%23${selectedOrder.orderNumber}`}
                  className="rounded-lg border border-line bg-white px-3 py-2 font-util text-xs uppercase tracking-wider text-ink-2 hover:bg-surface-2"
                >
                  ✉️ Email Customer
                </a>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-deep px-4 py-2 font-util text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#3D2A1E]"
              >
                Done / Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

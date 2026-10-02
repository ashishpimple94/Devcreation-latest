'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { ErrorState, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatRupee, cn, resolveImageUrl } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

// Allowed forward transitions, mirroring the backend state machine
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

const ORDER_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'Order Placed', icon: '📝' },
  { status: 'confirmed', label: 'Confirmed', icon: '✓' },
  { status: 'processing', label: 'Packing / Prep', icon: '📦' },
  { status: 'shipped', label: 'Shipped', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { success, error } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const applyStatus = async () => {
    if (!pendingStatus) return;
    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, pendingStatus, note || undefined);
      setOrder(updated);
      success(`Order updated to "${pendingStatus}"`);
      setPendingStatus(null);
      setNote('');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (!order) return;
    const a = order.shippingAddress;
    const text = `${a.fullName}\n${a.line1}${a.line2 ? `, ${a.line2}` : ''}\n${a.city}, ${a.state} - ${a.postalCode}\nPhone: ${a.phone}`;
    navigator.clipboard.writeText(text);
    success('Shipping address copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (errorMsg || !order) return <ErrorState message={errorMsg ?? 'Order not found'} onRetry={load} />;

  const customer = typeof order.user === 'object' && order.user ? order.user : null;
  const transitions = NEXT_STATUSES[order.status] ?? [];

  // Determine current step index for the lifecycle bar
  const stepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const isRefunded = order.status === 'refunded';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/orders')}
            className="rounded-lg border border-line bg-white p-2 text-ink-3 transition-colors hover:text-ink hover:border-gold"
            title="Back to orders"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-medium text-ink">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="mt-1 text-xs text-ink-3">
              Placed on {formatDateTime(order.placedAt ?? order.createdAt)}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 font-util text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:border-gold"
          >
            <span>🖨️</span>
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Order Progress Lifecycle Bar */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
        <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
          Fulfillment Journey
        </span>

        {isCancelled ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
            ⚠️ This order was cancelled and will not progress further.
          </div>
        ) : isRefunded ? (
          <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-700 font-medium">
            ↩️ This order has been refunded.
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = stepIndex >= idx;
              const isCurrent = stepIndex === idx;

              return (
                <div key={step.status} className="relative flex flex-1 flex-col items-center">
                  {/* Connecting Line */}
                  {idx > 0 && (
                    <div
                      className={cn(
                        'absolute -left-1/2 top-4 h-[2.5px] w-full -translate-y-1/2 transition-colors duration-500',
                        isCompleted ? 'bg-gold' : 'bg-line-soft',
                      )}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                      isCurrent
                        ? 'border-2 border-gold bg-gold text-white shadow-glow ring-4 ring-gold/20 scale-110'
                        : isCompleted
                          ? 'border border-gold bg-surface-2 text-gold-dk'
                          : 'border border-line bg-white text-ink-3 opacity-60',
                    )}
                  >
                    {step.icon}
                  </div>

                  <span
                    className={cn(
                      'mt-2 font-util text-[0.64rem] font-semibold uppercase tracking-wider text-center',
                      isCurrent ? 'text-gold-dk' : isCompleted ? 'text-ink' : 'text-ink-3 opacity-60',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Status Transition Action Bar */}
        {transitions.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
            <span className="text-xs text-ink-2">Advance order to next stage:</span>
            <div className="flex flex-wrap gap-2">
              {transitions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPendingStatus(s)}
                  className={cn(
                    'rounded-xl px-4 py-2 font-util text-xs font-bold uppercase tracking-wider transition-all',
                    s === 'cancelled'
                      ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border border-deep bg-deep text-white hover:bg-[#3D2A1E] shadow-xs',
                  )}
                >
                  Mark as {s} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Order Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Items Breakdown & Pricing */}
        <div className="space-y-6">
          {/* Items Table Card */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="font-display text-xl font-medium text-ink">Ordered Products</h2>
              <span className="font-util text-xs text-ink-3">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="divide-y divide-line-soft">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
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
                        <div className="flex h-full w-full items-center justify-center text-xs text-ink-3">
                          No Pic
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-display-alt text-base font-medium text-ink">{item.name}</h4>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
                        <span className="font-util text-[0.65rem] text-copper">SKU: {item.sku}</span>
                        {item.variantName && (
                          <span className="rounded bg-surface-2 px-2 py-0.5 text-[0.65rem] text-ink-2">
                            {item.variantName}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-body text-xs text-ink-2">
                        {formatRupee(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-body text-sm font-bold text-ink">
                      {formatRupee(item.price * item.quantity)}
                    </div>
                    <span className="font-util text-[0.6rem] text-emerald-700">In Stock Confirmed</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-4 border-t border-line pt-4 space-y-2">
              <div className="flex justify-between text-xs text-ink-2">
                <span>Items Subtotal</span>
                <span>{formatRupee(order.itemsTotal)}</span>
              </div>

              {order.discount && order.discount > 0 ? (
                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                  <span>
                    Discount Applied {order.promoCode ? `(${order.promoCode})` : ''}
                  </span>
                  <span>-{formatRupee(order.discount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-xs text-ink-2">
                <span>Shipping & Handling</span>
                <span>{order.shippingFee ? formatRupee(order.shippingFee) : 'Free Shipping'}</span>
              </div>

              <div className="flex justify-between border-t border-line-soft pt-3 text-base font-bold text-ink">
                <span>Total Amount</span>
                <span className="font-display text-xl text-gold-dk">{formatRupee(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer, Shipping & Audit Trail */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
              Customer Information
            </span>

            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold-dk">
                {customer?.name ? customer.name[0].toUpperCase() : 'C'}
              </span>

              <div className="flex-1 text-xs">
                <div className="font-bold text-sm text-ink">{customer?.name || order.shippingAddress.fullName}</div>
                {customer?.email && (
                  <a href={`mailto:${customer.email}`} className="mt-0.5 block text-gold hover:underline">
                    {customer.email}
                  </a>
                )}
                {order.shippingAddress.phone && (
                  <a href={`tel:${order.shippingAddress.phone}`} className="mt-0.5 block text-ink-2 hover:underline">
                    📞 {order.shippingAddress.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Card with 1-Click Copy */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                Delivery Address
              </span>
              <button
                type="button"
                onClick={copyAddressToClipboard}
                className="font-util text-[0.6rem] font-semibold uppercase text-gold hover:text-gold-dk hover:underline"
              >
                Copy Address
              </button>
            </div>

            <address className="mt-3 not-italic text-xs leading-relaxed text-ink">
              <div className="font-bold text-sm text-ink">{order.shippingAddress.fullName}</div>
              <div className="text-ink-2">{order.shippingAddress.line1}</div>
              {order.shippingAddress.line2 && <div className="text-ink-2">{order.shippingAddress.line2}</div>}
              <div className="text-ink-2 font-medium">
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
              </div>
              <div className="mt-1 text-ink-3">Phone: {order.shippingAddress.phone}</div>
            </address>
          </div>

          {/* Payment Card */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
              Payment Overview
            </span>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-ink-3">Payment Method:</span>
                <span className="font-semibold uppercase text-ink">{order.paymentMethod || 'Cash On Delivery'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-3">Payment Status:</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </div>

          {/* Audit Trail & History */}
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
              Audit Trail & Updates
            </span>

            <ol className="mt-3 divide-y divide-line-soft">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-util text-[0.65rem] font-bold uppercase text-gold-dk">{h.status}</span>
                    <span className="text-[0.65rem] text-ink-3">{formatDateTime(h.changedAt)}</span>
                  </div>
                  {h.note && <div className="mt-1 text-ink-2 italic">“{h.note}”</div>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={`Advance order to "${pendingStatus}"?`}
        message="This updates the order and notifies the customer in real time. You can add an optional note below."
        confirmLabel="Confirm Status Change"
        loading={updating}
        onConfirm={applyStatus}
        onCancel={() => setPendingStatus(null)}
      />

      {pendingStatus && (
        <div className="fixed bottom-6 left-1/2 z-[130] -translate-x-1/2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for customer / tracking (e.g. Courier: BlueDart, AWB: 12345)"
            className="w-[min(460px,90vw)] rounded-xl border border-line bg-white px-4 py-3 text-sm shadow-card outline-none focus:border-gold"
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { ErrorState, Skeleton, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatRupee } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

// Allowed forward transitions, mirroring the backend state machine (UX only —
// the backend re-validates every transition).
const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  const applyStatus = async () => {
    if (!pending) return;
    setUpdating(true);
    try {
      const updated = await adminService.updateOrderStatus(id, pending, note || undefined);
      setOrder(updated);
      success(`Order marked ${pending}`);
      setPending(null);
      setNote('');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (errorMsg || !order) return <ErrorState message={errorMsg ?? 'Not found'} onRetry={load} />;

  const customer = typeof order.user === 'object' ? order.user : null;
  const transitions = NEXT_STATUSES[order.status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-ink-3">Placed {formatDateTime(order.placedAt ?? order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Status actions */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <span className="util-label">Update status</span>
        {transitions.length === 0 ? (
          <p className="mt-2 text-sm text-ink-3">This order is in a final state and cannot change further.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => setPending(s)}
                className="rounded-lg border border-line px-4 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] text-ink-2 hover:border-gold hover:text-ink"
              >
                Mark {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <span className="util-label">Items</span>
          <div className="mt-3 divide-y divide-line-soft">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-line bg-surface-2">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{item.name}</div>
                  <div className="text-xs text-ink-3">
                    {item.sku} · Qty {item.quantity}
                  </div>
                </div>
                <div className="font-util text-xs text-ink">{formatRupee(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-line pt-4 text-sm">
            <Row label="Items total" value={formatRupee(order.itemsTotal)} />
            {order.discount && order.discount > 0 ? (
              <div className="mb-2 flex justify-between font-util text-xs text-forest">
                <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                <span>-{formatRupee(order.discount)}</span>
              </div>
            ) : null}
            <Row label="Shipping" value={order.shippingFee ? formatRupee(order.shippingFee) : 'Free'} />
            <div className="mt-2 flex justify-between font-util text-base text-ink">
              <span>Total</span>
              <span>{formatRupee(order.total)}</span>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <span className="util-label">Customer</span>
            <div className="mt-2 text-sm text-ink-2">
              {customer ? (
                <>
                  <div className="font-medium text-ink">{customer.name}</div>
                  <div>{customer.email}</div>
                  {customer.phone && <div>{customer.phone}</div>}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <span className="util-label">Shipping</span>
            <address className="mt-2 not-italic text-sm leading-relaxed text-ink-2">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.phone}
            </address>
          </div>

          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <span className="util-label">Audit trail</span>
            <ol className="mt-3 space-y-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="text-sm">
                  <div className="font-util text-[0.6rem] uppercase tracking-[0.12em] text-gold">{h.status}</div>
                  <div className="text-xs text-ink-3">{formatDateTime(h.changedAt)}</div>
                  {typeof h.changedBy === 'object' && h.changedBy && (
                    <div className="text-xs text-ink-3">by {h.changedBy.name}</div>
                  )}
                  {h.note && <div className="text-xs text-ink-2">{h.note}</div>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={`Mark order ${pending}?`}
        message="This updates the order and notifies the customer in real time. You can add an optional note below."
        confirmLabel="Confirm"
        loading={updating}
        onConfirm={applyStatus}
        onCancel={() => setPending(null)}
      />
      {pending && (
        <div className="fixed bottom-6 left-1/2 z-[130] -translate-x-1/2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (visible in audit trail)"
            className="w-[min(420px,90vw)] rounded-lg border border-line bg-white px-4 py-2.5 text-sm shadow-card outline-none focus:border-gold"
          />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex justify-between text-ink-2">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

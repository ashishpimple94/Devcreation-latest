'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderService } from '@/services/order.service';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/OrderStatusBadge';
import { Skeleton, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useSocket } from '@/hooks/useSocket';
import { formatDateTime, formatRupee, resolveImageUrl } from '@/lib/utils';
import type { Order } from '@/types';

const TIMELINE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

export function OrderDetailClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  const searchId = searchParams?.get('id') || searchParams?.get('order');

  let id = (rawId && rawId !== 'detail' && rawId !== 'sample' ? rawId : searchId) || '';
  if (!id && typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    const qId = sp.get('id') || sp.get('order');
    if (qId) {
      id = qId;
    } else {
      const match = window.location.pathname.match(/\/account\/orders\/([^/?#]+)/);
      if (match && match[1] && match[1] !== 'detail' && match[1] !== 'sample') {
        id = decodeURIComponent(match[1]);
      }
    }
  }

  const { success, error } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    if (!id || id === 'sample' || id === 'detail') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    orderService
      .getMine(id)
      .then((ord) => {
        setOrder(ord);
        setErrorMsg(null);
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  // Live-update this order when a real-time status change arrives.
  useSocket({
    onOrderUpdated: (payload) => {
      if (payload.relatedEntity?.id === id || payload.relatedEntity?.id === order?._id) load();
    },
  });

  const cancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancel(order._id);
      setOrder(updated);
      success('Order cancelled');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (!id || id === 'sample' || id === 'detail') {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface-2/60 p-8 text-center">
        <span className="text-4xl">📋</span>
        <h2 className="mt-3 font-display text-xl font-medium text-ink">No Order Selected</h2>
        <p className="mt-2 text-xs text-ink-3">Please choose an order from your order history to view tracking details.</p>
        <Link href="/account/orders" className="btn-primary mt-5 inline-block text-xs">
          View All Orders
        </Link>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface-2/60 p-8 text-center">
        <span className="text-4xl">🔍</span>
        <h2 className="mt-3 font-display text-xl font-medium text-ink">Order Not Found</h2>
        <p className="mt-2 text-xs text-ink-3">
          {errorMsg || `Could not find order "${id}". Please verify the order number or check your order history.`}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button onClick={load} className="btn-secondary text-xs">
            Try Again
          </button>
          <Link href="/account/orders" className="btn-primary text-xs">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);
  const currentStep = TIMELINE.indexOf(order.status as (typeof TIMELINE)[number]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-ink-3">Placed {formatDateTime(order.placedAt ?? order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="mb-8 flex items-center justify-between rounded-[10px] border border-line bg-surface p-5">
          {TIMELINE.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-util text-[0.62rem] ${
                  i <= currentStep ? 'bg-gold text-white' : 'bg-surface-3 text-ink-3'
                }`}
              >
                {i + 1}
              </div>
              <span className="mt-2 font-util text-[0.55rem] uppercase tracking-[0.1em] text-ink-3">{step}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[10px] border border-line bg-surface p-6">
          <span className="util-label">Items</span>
          <div className="mt-3 divide-y divide-line-soft">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-line bg-surface-2">
                  {item.image && (
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
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-display-alt text-base text-ink">{item.name}</div>
                  <div className="text-xs text-ink-3">
                    {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
                  </div>
                </div>
                <div className="font-body text-sm font-semibold tabular-nums text-ink">{formatRupee(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-line pt-4 text-sm">
            <Row label="Items total" value={formatRupee(order.itemsTotal)} />
            {order.discount && order.discount > 0 ? (
              <div className="mb-1.5 flex justify-between font-body text-sm tabular-nums text-forest">
                <span className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-forest">
                  Discount {order.promoCode ? `(${order.promoCode})` : ''}
                </span>
                <span>-{formatRupee(order.discount)}</span>
              </div>
            ) : null}
            <Row label="Shipping" value={order.shippingFee ? formatRupee(order.shippingFee) : 'Free'} />
            <div className="mt-2 flex justify-between font-body text-base font-semibold tabular-nums text-ink">
              <span className="font-util text-[0.68rem] font-normal uppercase tracking-[0.1em]">Total</span>
              <span>{formatRupee(order.total)}</span>
            </div>
          </div>

          {canCancel && (
            <Button variant="ghost" onClick={cancel} loading={cancelling} className="mt-5">
              Cancel order
            </Button>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[10px] border border-line bg-surface p-6">
            <span className="util-label">Shipping to</span>
            <address className="mt-3 not-italic text-sm leading-relaxed text-ink-2">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
          </div>

          <div className="rounded-[10px] border border-line bg-surface p-6">
            <span className="util-label">History</span>
            <ol className="mt-3 space-y-3">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="text-sm">
                  <div className="font-util text-[0.62rem] uppercase tracking-[0.12em] text-gold">{h.status}</div>
                  <div className="text-xs text-ink-3">{formatDateTime(h.changedAt)}</div>
                  {h.note && <div className="text-xs text-ink-2">{h.note}</div>}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 flex justify-between font-body text-sm tabular-nums text-ink-2">
      <span className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-ink-3">{label}</span>
      <span>{value}</span>
    </div>
  );
}

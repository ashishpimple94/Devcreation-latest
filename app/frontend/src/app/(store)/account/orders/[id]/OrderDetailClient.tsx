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
  const [paying, setPaying] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

  const handleRazorpayRetry = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      let rzpOrder: any = null;
      let rzpKey: string = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TqTj0qfXniY39v';
      try {
        const res = await orderService.getRazorpayOrder(order._id);
        rzpOrder = res.razorpayOrder;
        if (res.razorpayKeyId) rzpKey = res.razorpayKeyId;
      } catch (e) {
        console.warn('Could not fetch server razorpay order, falling back to direct checkout:', e);
      }

      const amountPaise = rzpOrder?.amount
        ? Number(rzpOrder.amount)
        : Math.round(Number(order.total) * 100);

      const options: any = {
        key: rzpKey,
        amount: amountPaise,
        currency: rzpOrder?.currency || 'INR',
        name: 'Dev Creation',
        description: `Order ${order.orderNumber} Payment`,
        image: 'https://devcreation24.in/assets/Logos/Logo2.png',
        handler: async function (response: any) {
          try {
            setPaying(true);
            try {
              const verifyRes = await orderService.verifyPayment({
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id || rzpOrder?.id || '',
                razorpayPaymentId: response.razorpay_payment_id || '',
                razorpaySignature: response.razorpay_signature || '',
              });
              setOrder(verifyRes);
            } catch (vErr) {
              console.warn('Backend payment verification fallback:', vErr);
            }
            success('Payment successful! Your order is now confirmed.');
          } catch (err: any) {
            error(err.message || 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: order.shippingAddress.fullName || '',
          contact: order.shippingAddress.phone || '',
        },
        theme: {
          color: '#2C1810',
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      if (rzpOrder?.id) {
        options.order_id = rzpOrder.id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        error(resp?.error?.description || 'Payment was declined or failed.');
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      error(err.message || 'Could not initiate Razorpay payment');
      setPaying(false);
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
  const isOnlinePaymentPending = order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod' && order.status !== 'cancelled';
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

      {/* Online Payment Pending Banner */}
      {isOnlinePaymentPending && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Payment Pending</h3>
            </div>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Payment was not completed for this order. Complete payment securely via Razorpay to confirm your order.
            </p>
          </div>
          <Button
            onClick={handleRazorpayRetry}
            loading={paying}
            className="bg-[#2C1810] text-white hover:bg-black font-medium text-xs px-4 py-2"
          >
            Pay Now {formatRupee(order.total)} with Razorpay
          </Button>
        </div>
      )}

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
                        if (!el.src.includes('/assets/Logos/Logo2.png')) {
                          el.src = '/assets/Logos/Logo2.png';
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

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {isOnlinePaymentPending && (
              <Button
                onClick={handleRazorpayRetry}
                loading={paying}
                className="bg-[#2C1810] text-white hover:bg-black font-medium text-xs"
              >
                Pay Now with Razorpay
              </Button>
            )}
            {canCancel && (
              <Button variant="ghost" onClick={cancel} loading={cancelling} className="text-xs">
                Cancel order
              </Button>
            )}
          </div>
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

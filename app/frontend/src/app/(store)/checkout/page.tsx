'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { orderService } from '@/services/order.service';
import { formatRupee, resolveImageUrl } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Button, EmptyState } from '@/components/ui';
import { RedeemGiftCard } from '@/components/cart/RedeemGiftCard';
import type { Address, PaymentMethod, ShippingAddress } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

const EMPTY_ADDRESS: ShippingAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

function loadRazorpayScript(): Promise<boolean> {
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
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh, clear, appliedGiftCard, getDiscount, getFinalTotal } = useCartStore();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { success, error } = useToast();
  const discount = getDiscount();
  const finalTotal = getFinalTotal();

  const [saved, setSaved] = useState<Address[]>([]);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      void refresh();
      orderService
        .addresses()
        .then((list) => {
          setSaved(list);
          const def = list.find((a) => a.isDefault) ?? list[0];
          if (def) setAddress({ ...def });
        })
        .catch(() => setSaved([]));
    }
  }, [status, refresh]);

  const set = (key: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const order = await orderService.checkout(address, payment, appliedGiftCard?.code);

      // COD: order confirmed immediately — no payment gateway needed.
      if (payment === 'cod') {
        await clear();
        success(`Order ${order.orderNumber} placed successfully`);
        router.push(`/account/orders/${order._id}`);
        return;
      }

      // UPI / Card: open Razorpay payment modal.
      // Order stays PENDING until payment is verified — it is NOT confirmed yet.
      const loaded = await loadRazorpayScript();
      if (!loaded || typeof (window as any).Razorpay === 'undefined') {
        error('Could not load payment gateway. Your order is saved as pending.');
        router.push(`/account/orders/${order._id}`);
        return;
      }

      const rzpKey = order.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        error('Payment gateway key not found. Your order is pending — our team will contact you.');
        router.push(`/account/orders/${order._id}`);
        return;
      }

      const options: any = {
        key: rzpKey,
        amount: order.razorpayOrder?.amount || Math.round(Number(order.total || finalTotal) * 100),
        currency: order.razorpayOrder?.currency || 'INR',
        name: 'Dev Creation',
        description: `Order #${order.orderNumber}`,
        image: '/assets/Logos/Logo2.png',
        order_id: order.razorpayOrder?.id,
        prefill: { name: address.fullName, contact: address.phone, email: user?.email || '' },
        theme: { color: '#2C1810' },

        // Payment succeeded in the modal — NOW verify with backend.
        // Only confirm the order if verification passes.
        handler: async (response: any) => {
          try {
            await orderService.verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id || order.razorpayOrderId || '',
              razorpayPaymentId: response.razorpay_payment_id || '',
              razorpaySignature: response.razorpay_signature || '',
            });
            // Verification SUCCEEDED — order is now CONFIRMED + PAID.
            await clear();
            success(`Payment successful! Order #${order.orderNumber} confirmed.`);
            router.push(`/account/orders/${order._id}`);
          } catch (verifyErr) {
            // Verification FAILED — order stays PENDING, NOT confirmed.
            setPlacing(false);
            error(
              verifyErr instanceof Error
                ? `Payment verification failed: ${verifyErr.message}`
                : 'Payment verification failed. Your order is pending.'
            );
            router.push(`/account/orders/${order._id}`);
          }
        },

        modal: {
          ondismiss: () => {
            // User closed the modal without paying — order stays PENDING.
            setPlacing(false);
            error('Payment was not completed. Your order is saved as pending.');
            router.push(`/account/orders/${order._id}`);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        // Payment was declined — order stays PENDING.
        setPlacing(false);
        error(`Payment failed: ${resp.error?.description || 'Transaction declined'}. Order is pending.`);
      });
      rzp.open();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not place order');
      setPlacing(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <section className="px-[var(--pad)] py-[clamp(48px,8vh,96px)]">
        <EmptyState
          title="Log in to check out"
          action={<Link href="/login?redirect=/checkout" className="btn-primary mt-2">Log in</Link>}
        />
      </section>
    );
  }

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <h1 className="mb-8 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">Checkout</h1>

      {items.length === 0 ? (
        <EmptyState title="Your cart is empty" action={<Link href="/products" className="btn-primary mt-2">Shop</Link>} />
      ) : (
        <form onSubmit={placeOrder} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="flex flex-col gap-6 rounded-[10px] border border-line bg-surface p-6">
            {saved.length > 0 && (
              <div>
                <span className="util-label">Saved addresses</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {saved.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => setAddress({ ...a })}
                      className={`rounded-[8px] border px-3 py-2 text-left text-xs transition-colors ${
                        address.line1 === a.line1 && address.postalCode === a.postalCode
                          ? 'border-gold bg-[rgba(184,148,63,.08)] text-ink'
                          : 'border-line text-ink-2 hover:border-gold'
                      }`}
                    >
                      {a.fullName}, {a.city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="util-label">Shipping address</span>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input placeholder="Full name" value={address.fullName} onChange={set('fullName')} required className="sm:col-span-2" />
                <Input placeholder="Phone" value={address.phone} onChange={set('phone')} required className="sm:col-span-2" />
                <Input placeholder="Address line 1" value={address.line1} onChange={set('line1')} required className="sm:col-span-2" />
                <Input placeholder="Address line 2 (optional)" value={address.line2 ?? ''} onChange={set('line2')} className="sm:col-span-2" />
                <Input placeholder="City" value={address.city} onChange={set('city')} required />
                <Input placeholder="State" value={address.state} onChange={set('state')} required />
                <Input placeholder="Postal code" value={address.postalCode} onChange={set('postalCode')} required />
                <Input placeholder="Country" value={address.country} onChange={set('country')} required />
              </div>
            </div>

            <div>
              <span className="util-label">Payment method</span>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {(['cod', 'upi', 'card'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayment(m)}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-[10px] border px-4 py-3 font-util text-[0.68rem] uppercase tracking-[0.1em] transition-all ${
                      payment === m
                        ? 'border-deep bg-deep text-white shadow-xs'
                        : 'border-line bg-white text-ink hover:border-gold'
                    }`}
                  >
                    <span className="font-semibold">
                      {m === 'cod' ? 'Cash on Delivery' : m === 'upi' ? 'Instant UPI' : 'Cards / Net Banking'}
                    </span>
                    {m === 'upi' && (
                      <div className="flex h-5 items-center justify-center rounded bg-white px-2 py-0.5">
                        <Image
                          src="/assets/upi.jpg"
                          alt="UPI"
                          width={38}
                          height={14}
                          className="h-3 w-auto object-contain"
                        />
                      </div>
                    )}
                    {m === 'card' && (
                      <div className="flex h-5 items-center justify-center gap-1.5 rounded bg-white px-1.5 py-0.5">
                        <Image
                          src="/assets/Visa.webp"
                          alt="Visa"
                          width={26}
                          height={12}
                          className="h-2.5 w-auto object-contain"
                        />
                        <Image
                          src="/assets/Mastercard.png"
                          alt="Mastercard"
                          width={20}
                          height={12}
                          className="h-3 w-auto object-contain"
                        />
                        <Image
                          src="/assets/Rupay.png"
                          alt="RuPay"
                          width={28}
                          height={12}
                          className="h-2.5 w-auto object-contain"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-dashed border-line bg-surface-2 p-4 text-xs leading-relaxed text-ink-3">
              We pack every order in reusable, plastic-free wrapping. Deliveries typically arrive within 3–5 business
              days across India. You&apos;ll get real-time status updates on your{' '}
              <Link href="/account/orders" className="text-gold hover:text-gold-dk">orders page</Link> once this is placed.
            </div>
          </div>

          <aside className="h-fit rounded-[10px] border border-line bg-surface-2 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Order summary</h2>
              <Link href="/cart" className="font-util text-[0.62rem] uppercase tracking-[0.12em] text-gold hover:text-gold-dk">
                Edit cart
              </Link>
            </div>
            <p className="mb-4 font-util text-[0.62rem] uppercase tracking-[0.14em] text-ink-3">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={`${i.product.id}-${i.variantSku ?? ''}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[8px] border border-line bg-surface">
                    {i.product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(i.product.image)}
                        alt={i.product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget;
                          if (!el.src.includes('/assets/Logos/Logo2.png')) {
                            el.src = '/assets/Logos/Logo2.png';
                          }
                        }}
                      />
                    ) : null}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-deep px-1 font-body text-[0.65rem] font-semibold tabular-nums text-white">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-display-alt text-sm text-ink">{i.product.name}</div>
                    <div className="font-body text-xs tabular-nums text-ink-3">
                      {i.variantSku ? `${i.variantSku} · ` : ''}
                      {formatRupee(i.unitPrice)} × {i.quantity}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold text-ink">{formatRupee(i.lineTotal)}</div>
                </div>
              ))}
            </div>

            <RedeemGiftCard className="my-4" />

            <div className="mt-4 border-t border-line pt-4 text-sm">
              <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`} value={formatRupee(cart!.itemsTotal)} />
              {discount > 0 && (
                <div className="mb-1.5 flex justify-between font-body text-sm tabular-nums text-forest">
                  <span className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-forest">
                    Discount ({appliedGiftCard?.code})
                  </span>
                  <span>-{formatRupee(discount)}</span>
                </div>
              )}
              <Row label="Shipping" value={cart!.shippingFee ? formatRupee(cart!.shippingFee) : 'Free'} />
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold text-ink">
                <span className="font-util text-[0.68rem] font-normal uppercase tracking-[0.1em]">Total</span>
                <span>{formatRupee(finalTotal)}</span>
              </div>
            </div>

            <Button type="submit" loading={placing} className="mt-5 w-full">
              {placing
                ? 'Processing...'
                : payment === 'cod'
                ? 'Place Order (Cash on Delivery)'
                : 'Pay Now'}
            </Button>
            <div className="mt-3.5 flex items-center justify-center gap-1.5 font-util text-[0.62rem] text-ink-3">
              <span>🔒</span>
              <span>
                {payment === 'cod'
                  ? 'Pay when your order arrives'
                  : 'Secured by Razorpay · Order confirmed only after payment success'}
              </span>
            </div>
            <p className="mt-2 text-center text-[0.72rem] text-ink-3">
              By placing your order you agree to pay {formatRupee(finalTotal)} via{' '}
              {payment === 'cod' ? 'Cash on Delivery' : payment === 'upi' ? 'UPI' : 'Card / Net Banking'}.
            </p>
          </aside>
        </form>
      )}
    </section>
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

function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold ${className ?? ''}`}
    />
  );
}

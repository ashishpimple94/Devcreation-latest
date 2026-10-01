'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, formatRupee } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui';
import { RedeemGiftCard } from '@/components/cart/RedeemGiftCard';

/** Slide-in cart drawer, ported from the original design and wired to the API. */
export function CartDrawer() {
  const router = useRouter();
  const { cart, isOpen, loading, close, update, remove, appliedGiftCard, getDiscount, getFinalTotal } = useCartStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  const items = cart?.items ?? [];
  const itemsTotal = cart?.itemsTotal ?? 0;
  const shippingFee = cart?.shippingFee ?? 0;
  const discount = getDiscount();
  const finalTotal = getFinalTotal();

  const shipNote =
    itemsTotal === 0
      ? 'Free shipping over ₹999'
      : shippingFee
        ? `Add ${formatRupee(999 - itemsTotal)} more for free shipping`
        : 'Shipping is on us';

  const goToCheckout = () => {
    close();
    router.push(user ? '/checkout' : '/login?redirect=/checkout');
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[80] bg-[rgba(28,20,16,.3)] backdrop-blur-[3px] transition-opacity duration-[320ms]',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
        aria-hidden
      />
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={cn(
          'fixed right-0 top-0 z-[90] flex h-[100dvh] w-[min(400px,100%)] flex-col border-l border-line bg-surface shadow-drawer transition-transform duration-[400ms]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-[26px] py-6">
          <h3 className="font-display text-[1.38rem] text-ink">Your cart</h3>
          <button onClick={close} aria-label="Close cart" className="px-2 py-1 text-2xl leading-none text-ink-2 hover:text-gold">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[26px] py-2">
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Spinner className="text-gold" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-14 text-center text-sm">
              <span className="util-label mb-2.5 block">Nothing here yet</span>
              Pick a fragrance and it will show up in this drawer.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.variantSku ?? ''}`}
                className="grid grid-cols-[1fr_auto] gap-x-[14px] gap-y-2 border-b border-line-soft py-5"
              >
                <div>
                  <h4 className="font-display-alt text-[1.08rem] font-medium text-ink">{item.product.name}</h4>
                  <div className="mt-1 font-body text-[0.72rem] font-medium tabular-nums text-copper">
                    {item.product.weight ? `${item.product.weight} · ` : ''}
                    {formatRupee(item.unitPrice)}
                  </div>
                  <div className="mt-2.5 flex items-center gap-0.5">
                    <button
                      onClick={() => update(item.product.id, item.quantity - 1, item.variantSku)}
                      aria-label="Reduce quantity"
                      className="h-7 w-7 border border-line text-sm leading-none text-ink hover:border-gold hover:text-gold"
                    >
                      −
                    </button>
                    <span className="min-w-[34px] text-center font-body text-[0.85rem] font-medium tabular-nums text-ink">{item.quantity}</span>
                    <button
                      onClick={() => update(item.product.id, item.quantity + 1, item.variantSku)}
                      aria-label="Increase quantity"
                      className="h-7 w-7 border border-line text-sm leading-none text-ink hover:border-gold hover:text-gold"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(item.product.id, item.variantSku)}
                      className="ml-3 font-util text-[0.55rem] uppercase tracking-[0.14em] text-ink-3 hover:text-gold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="self-end font-body text-[0.9rem] font-semibold tabular-nums text-ink">{formatRupee(item.lineTotal)}</div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-line bg-surface-2 px-[26px] pb-[26px] pt-[20px]">
          {items.length > 0 && <RedeemGiftCard compact className="mb-3.5" />}

          <div className="mb-2.5 flex justify-between font-body text-[0.78rem] tabular-nums text-ink-2">
            <span className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">Subtotal</span>
            <span>{formatRupee(itemsTotal)}</span>
          </div>

          {discount > 0 && (
            <div className="mb-2.5 flex justify-between font-body text-[0.78rem] tabular-nums text-forest">
              <span className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-forest">
                Discount ({appliedGiftCard?.code})
              </span>
              <span>-{formatRupee(discount)}</span>
            </div>
          )}

          <div className="mb-2.5 flex justify-between font-body text-[0.78rem] tabular-nums text-ink-2">
            <span className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">Shipping</span>
            <span>{itemsTotal === 0 ? '—' : shippingFee ? formatRupee(shippingFee) : 'Free'}</span>
          </div>
          <div className="mt-3.5 flex justify-between border-t border-line pt-3 font-body text-[1.02rem] font-semibold tabular-nums text-ink">
            <span className="font-util text-[0.68rem] font-normal uppercase tracking-[0.1em]">Total</span>
            <span>{formatRupee(finalTotal)}</span>
          </div>
          <button onClick={goToCheckout} disabled={items.length === 0} className="btn-primary mt-[18px] w-full disabled:opacity-60">
            {user ? 'Checkout' : 'Login to checkout'}
          </button>
          <Link href="/cart" onClick={close} className="mt-3 block text-center font-util text-[0.6rem] uppercase tracking-[0.16em] text-ink-3 hover:text-ink">
            View full cart
          </Link>
          <p className="mt-3 text-center text-[0.74rem] text-forest-lt">{shipNote}</p>
        </div>
      </aside>
    </>
  );
}

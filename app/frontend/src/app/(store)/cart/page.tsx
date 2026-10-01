'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatRupee } from '@/lib/utils';
import { EmptyState, Spinner } from '@/components/ui';
import { RedeemGiftCard } from '@/components/cart/RedeemGiftCard';

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, refresh, update, remove, appliedGiftCard, getDiscount, getFinalTotal } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const discount = getDiscount();
  const finalTotal = getFinalTotal();

  useEffect(() => {
    if (status === 'authenticated') void refresh();
  }, [status, refresh]);

  if (status === 'unauthenticated') {
    return (
      <section className="px-[var(--pad)] py-[clamp(48px,8vh,96px)]">
        <EmptyState
          title="Log in to view your cart"
          hint="Your cart is saved to your account so you can pick up where you left off."
          action={
            <Link href="/login?redirect=/cart" className="btn-primary mt-2">
              Log in
            </Link>
          }
        />
      </section>
    );
  }

  const items = cart?.items ?? [];

  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <h1 className="mb-8 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">Your cart</h1>

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <Spinner className="text-gold" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          hint="Explore the collection and add a fragrance you love."
          action={
            <Link href="/products" className="btn-primary mt-2">
              Shop the collection
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variantSku ?? ''}`} className="flex gap-4 border-b border-line py-5">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[8px] border border-line bg-surface-2">
                  {item.product.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <Link href={`/products/${item.product.slug}`} className="font-display-alt text-xl font-medium text-ink hover:text-gold">
                    {item.product.name}
                  </Link>
                  <span className="mt-1 font-body text-sm font-medium tabular-nums text-copper">
                    {formatRupee(item.unitPrice)}
                  </span>
                  <div className="mt-auto flex items-center gap-0.5 pt-3">
                    <button onClick={() => update(item.product.id, item.quantity - 1, item.variantSku)} className="h-8 w-8 border border-line text-ink hover:border-gold">
                      −
                    </button>
                    <span className="min-w-[36px] text-center font-body text-sm font-medium tabular-nums text-ink">{item.quantity}</span>
                    <button onClick={() => update(item.product.id, item.quantity + 1, item.variantSku)} className="h-8 w-8 border border-line text-ink hover:border-gold">
                      +
                    </button>
                    <button onClick={() => remove(item.product.id, item.variantSku)} className="ml-4 font-util text-[0.58rem] uppercase tracking-[0.14em] text-ink-3 hover:text-gold">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="self-center font-body text-sm font-semibold tabular-nums text-ink">{formatRupee(item.lineTotal)}</div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[10px] border border-line bg-surface-2 p-6">
            <h2 className="mb-4 font-display text-xl text-ink">Order summary</h2>
            
            <RedeemGiftCard className="mb-5" />

            <Row label="Subtotal" value={formatRupee(cart!.itemsTotal)} />
            {discount > 0 && (
              <div className="mb-2.5 flex justify-between font-body text-[0.82rem] tabular-nums text-forest">
                <span className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-forest">
                  Discount ({appliedGiftCard?.code})
                </span>
                <span>-{formatRupee(discount)}</span>
              </div>
            )}
            <Row label="Shipping" value={cart!.shippingFee ? formatRupee(cart!.shippingFee) : 'Free'} />
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-body text-base font-semibold tabular-nums text-ink">
              <span className="font-util text-[0.68rem] font-normal uppercase tracking-[0.1em]">Total</span>
              <span>{formatRupee(finalTotal)}</span>
            </div>
            <button onClick={() => router.push(user ? '/checkout' : '/login?redirect=/checkout')} className="btn-primary mt-5 w-full">
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2.5 flex justify-between font-body text-[0.82rem] tabular-nums text-ink-2">
      <span className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">{label}</span>
      <span>{value}</span>
    </div>
  );
}

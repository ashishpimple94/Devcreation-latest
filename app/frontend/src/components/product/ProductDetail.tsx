'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupee, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { ProductCard } from '@/components/product/ProductCard';
import { api } from '@/lib/api';
import type { Product } from '@/types';

/** Product detail view: gallery, variant/quantity selection, add-to-cart, wishlist. */
export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const images = product.images.length ? product.images : [{ url: '/assets/Logos/logo.jpeg', alt: product.name }];
  const [activeImg, setActiveImg] = useState(0);
  const [variantSku, setVariantSku] = useState<string | undefined>(product.variants[0]?.sku);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishing, setWishing] = useState(false);

  const add = useCartStore((s) => s.add);
  const closeCart = useCartStore((s) => s.close);
  const user = useAuthStore((s) => s.user);
  const { success, error } = useToast();
  const router = useRouter();

  const activeVariant = product.variants.find((v) => v.sku === variantSku);
  const price = activeVariant?.price ?? product.price;
  const stock = activeVariant?.stock ?? product.stock;

  const handleAdd = async () => {
    if (!user) {
      error('Please log in to add items to your cart');
      return;
    }
    setAdding(true);
    try {
      await add(product._id, qty, variantSku);
      success('Added to cart');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      error('Please log in to buy this item');
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    setBuying(true);
    try {
      await add(product._id, qty, variantSku);
      closeCart();
      router.push('/checkout');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not proceed to checkout');
    } finally {
      setBuying(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      error('Please log in to save to your wishlist');
      return;
    }
    setWishing(true);
    try {
      const res = await api.post<{ inWishlist: boolean }>(`/users/me/wishlist/${product._id}`);
      success(res.data.inWishlist ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not update wishlist');
    } finally {
      setWishing(false);
    }
  };

  return (
    <section className="px-[var(--pad)] py-[clamp(40px,6vh,80px)]">
      <nav className="mb-8 font-util text-[0.62rem] uppercase tracking-[0.16em] text-ink-3">
        <Link href="/" className="hover:text-ink">Home</Link> ·{' '}
        <Link href="/products" className="hover:text-ink">Collection</Link> ·{' '}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-[400px_1fr] lg:grid-cols-[440px_1fr] lg:gap-14 items-start">
        {/* Gallery — Medium sized luxury presentation */}
        <div className="w-full max-w-[440px] mx-auto md:mx-0 md:sticky md:top-24">
          <div className="relative h-[380px] sm:h-[420px] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImg].url}
              alt={images[activeImg].alt ?? product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            {/* Badges on medium image frame */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
              {product.tags.some((t) => t.toLowerCase().includes('offer') || t.toLowerCase().includes('deal')) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-flame/40 bg-flame/95 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                  🔥 Special Offer
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="inline-flex items-center rounded-full bg-deep/90 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-gold-lt shadow-sm backdrop-blur-xs">
                  {product.discountPercent ? `${product.discountPercent}% OFF` : `Save ${formatRupee(product.compareAtPrice - price)}`}
                </span>
              )}
            </div>

            {product.weight && (
              <span className="absolute right-3 top-3 z-10 rounded-full border border-gold/30 bg-white/95 px-2.5 py-0.5 font-util text-[0.58rem] font-semibold uppercase tracking-wider text-gold-dk shadow-xs backdrop-blur-md">
                🎁 {product.weight}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-3.5 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                    i === activeImg
                      ? 'border-gold shadow-xs ring-2 ring-gold/20'
                      : 'border-line opacity-75 hover:opacity-100 hover:border-gold/50',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-util text-[0.6rem] uppercase tracking-[0.2em] text-gold">{product.type}</span>
            {product.weight && (
              <span className="rounded-full bg-gold/10 px-2 py-0.5 font-util text-[0.55rem] font-semibold uppercase text-gold-dk">
                {product.weight}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display-alt text-[clamp(2rem,3.5vw,2.75rem)] font-medium leading-tight text-ink">{product.name}</h1>

          {product.fragrance && (
            <p className="mt-3 inline-block w-fit rounded-lg border border-line-soft bg-surface-2 px-3 py-1 text-sm text-ink-2">
              Fragrance · <strong className="font-medium text-ink">{product.fragrance}</strong>
            </p>
          )}

          {/* Pricing with Offer / Compare-At Support */}
          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="font-body text-2xl font-bold tabular-nums text-ink">{formatRupee(price)}</span>
            {product.compareAtPrice && product.compareAtPrice > price && (
              <span className="font-body text-base text-ink-3 line-through">
                {formatRupee(product.compareAtPrice)}
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > price && (
              <span className="rounded-full bg-flame/15 px-2.5 py-0.5 font-util text-[0.62rem] font-bold text-flame">
                {product.discountPercent ? `${product.discountPercent}% OFF` : 'Active Deal'}
              </span>
            )}
          </div>

          <p className="mt-4 max-w-[56ch] leading-[1.8] text-body text-sm sm:text-base">{product.description}</p>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <span className="util-label">Options</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => setVariantSku(v.sku)}
                    className={cn(
                      'rounded-[8px] border px-4 py-2 font-util text-[0.68rem] uppercase tracking-[0.1em] transition-colors',
                      variantSku === v.sku ? 'border-deep bg-deep text-white' : 'border-line text-ink hover:border-gold',
                    )}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-0.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-10 w-10 border border-line text-ink hover:border-gold" aria-label="Decrease">
                −
              </button>
              <span className="min-w-[44px] text-center font-body text-sm font-medium tabular-nums text-ink">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock || 99, q + 1))} className="h-10 w-10 border border-line text-ink hover:border-gold" aria-label="Increase">
                +
              </button>
            </div>
            <span className={cn('font-util text-[0.62rem] uppercase tracking-[0.14em]', stock > 0 ? 'text-forest' : 'text-red-500')}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleAdd} loading={adding} disabled={stock <= 0 || buying}>
              {stock <= 0 ? 'Sold out' : 'Add to cart'}
            </Button>
            <Button onClick={handleBuyNow} loading={buying} disabled={stock <= 0 || adding} className="bg-gold hover:bg-gold-lt border-gold text-white">
              {stock <= 0 ? 'Sold out' : 'Buy now'}
            </Button>
            <Button variant="ghost" onClick={toggleWishlist} loading={wishing}>
              ♡ Wishlist
            </Button>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-medium text-ink">You may also like</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import { formatRupee, cn, resolveImageUrl } from '@/lib/utils';
import type { ProductImage } from '@/types';

interface ProductPreviewCardProps {
  name: string;
  type: string;
  fragrance: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  offerBadge?: string;
  packType?: string;
  weight?: string;
  tags: string[];
  images: ProductImage[];
  stock: number;
}

/**
 * Enterprise Product Preview Card.
 * Adopts Amazon's high-converting structure (Ratings, Choice Badge, Buy Box, Prime Delivery)
 * while preserving Dev Creation's authentic luxury brand aesthetic, fonts, and gold-cream palette.
 */
export function ProductPreviewCard({
  name,
  type,
  fragrance,
  description,
  price,
  compareAtPrice,
  discountPercent = 0,
  offerBadge,
  packType,
  weight,
  tags,
  images,
  stock,
}: ProductPreviewCardProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [mode, setMode] = useState<'amazon' | 'storefront'>('amazon');
  const [previewAdded, setPreviewAdded] = useState(false);

  const displayImages = images.length
    ? images.map((im) => ({ ...im, url: resolveImageUrl(im.url) }))
    : [{ url: '/assets/Logos/logo.jpeg', alt: name || 'Product' }];
  const hasSlider = displayImages.length > 1;

  const currentImg = displayImages[Math.min(activeImg, displayImages.length - 1)] ?? displayImages[0];

  const handlePreviewAdd = () => {
    setPreviewAdded(true);
    setTimeout(() => setPreviewAdded(false), 1200);
  };

  const effectiveComparePrice = compareAtPrice && compareAtPrice > price
    ? compareAtPrice
    : discountPercent > 0
      ? Math.round(price / (1 - discountPercent / 100))
      : undefined;

  const effectiveDiscount = effectiveComparePrice && effectiveComparePrice > price
    ? Math.round(((effectiveComparePrice - price) / effectiveComparePrice) * 100)
    : discountPercent;

  const hasDiscount = (effectiveComparePrice && effectiveComparePrice > price) || discountPercent > 0;
  const calculatedSavings = effectiveComparePrice && effectiveComparePrice > price ? effectiveComparePrice - price : 0;

  return (
    <div className="flex flex-col">
      {/* Mode Switcher Tabs */}
      <div className="mb-3 flex items-center justify-between border-b border-line pb-2.5">
        <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-3">
          Live Product Preview
        </span>
        <div className="flex rounded-lg bg-surface-2 p-0.5 border border-line">
          <button
            type="button"
            onClick={() => setMode('amazon')}
            className={cn(
              'rounded-md px-2.5 py-1 font-util text-[0.6rem] font-bold uppercase transition-all',
              mode === 'amazon'
                ? 'bg-deep text-white shadow-xs'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            📦 Amazon Preview
          </button>
          <button
            type="button"
            onClick={() => setMode('storefront')}
            className={cn(
              'rounded-md px-2.5 py-1 font-util text-[0.6rem] font-bold uppercase transition-all',
              mode === 'storefront'
                ? 'bg-gold text-white shadow-xs'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            🛍️ Storefront Card
          </button>
        </div>
      </div>

      {mode === 'amazon' ? (
        /* ══════════════════════════════════════════════════════
           AMAZON STRUCTURE WITH DEV CREATION LUXURY THEME & FONTS
        ══════════════════════════════════════════════════════ */
        <article className="rounded-xl border border-line bg-surface p-4 shadow-sm text-ink antialiased">
          {/* Top Brand & Badge */}
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="font-util text-[0.6rem] font-semibold uppercase tracking-wider text-gold-dk">
              Brand: Dev Creation
            </span>
            <span className="inline-flex items-center rounded-full bg-deep text-white px-2 py-0.5 font-util text-[0.55rem] font-bold">
              <span>Dev’s</span>&nbsp;<span className="text-gold-lt">Choice</span>
            </span>
          </div>

          {/* Image + Slider */}
          <div className="relative mt-3 h-[240px] w-full overflow-hidden rounded-xl border border-line bg-surface-2 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(currentImg.url)}
              alt={currentImg.alt || name || 'Product image'}
              className="h-full w-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                  el.src = '/assets/Logos/logo.jpeg';
                }
              }}
            />

            {/* Deal Badge Overlay */}
            {hasDiscount && (
              <span className="absolute left-2 top-2 rounded-full border border-flame/40 bg-flame/95 px-2 py-0.5 font-util text-[0.55rem] font-bold uppercase text-white shadow-xs">
                {offerBadge || '🔥 Limited Deal'}
              </span>
            )}

            {(packType || weight) && (
              <span className="absolute right-2 top-2 rounded-full border border-gold/30 bg-white/95 px-2 py-0.5 font-util text-[0.55rem] font-bold text-gold-dk shadow-xs">
                🎁 {packType || weight}
              </span>
            )}
          </div>

          {/* Mini Thumbnail Row */}
          {hasSlider && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {displayImages.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    'h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border-2 p-0.5 bg-surface-2 transition-all',
                    activeImg === i ? 'border-gold ring-1 ring-gold/30' : 'border-line opacity-75',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(img.url)}
                    alt=""
                    className="h-full w-full object-cover rounded"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                        el.src = '/assets/Logos/logo.jpeg';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Title & Ratings in Dev Creation Serif Typography */}
          <div className="mt-3 space-y-1">
            <h3 className="font-display-alt text-lg font-medium text-ink line-clamp-2 leading-tight">
              {name || 'Product Title'}
            </h3>

            {fragrance && (
              <div className="font-body text-xs text-ink-2">
                Fragrance · <strong className="font-medium text-ink">{fragrance}</strong>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs pt-0.5">
              <span className="text-gold">★★★★★</span>
              <span className="font-body font-semibold text-ink">4.9</span>
              <span className="font-body text-ink-3">(142 reviews)</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-2.5 border-t border-line-soft pt-2">
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="rounded-full bg-flame/15 px-2 py-0.2 font-util text-[0.55rem] font-bold uppercase text-flame">
                  Deal
                </span>
                <span className="font-body text-xs font-bold text-flame">
                  -{effectiveDiscount}%
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="font-body text-2xl font-bold tabular-nums text-ink">
                {formatRupee(price || 0)}
              </span>
              {effectiveComparePrice && effectiveComparePrice > price && (
                <span className="font-body text-xs text-ink-3 line-through">
                  M.R.P.: {formatRupee(effectiveComparePrice)}
                </span>
              )}
            </div>
            <p className="font-body text-[0.7rem] text-ink-3">Inclusive of all taxes</p>
          </div>

          {/* Buy Box Sneak Peek in Brand Palette */}
          <div className="mt-2.5 rounded-xl border border-line p-3 bg-surface-2 space-y-2">
            <div className="flex items-center justify-between font-body text-xs">
              <span className="font-util text-[0.62rem] uppercase tracking-wider font-bold text-emerald-700">
                {stock > 0 ? '✓ In stock' : '✕ Out of stock'}
              </span>
              <span className="text-ink-3 text-[0.68rem]">
                🚚 <strong>FREE delivery</strong> in 2-3 days
              </span>
            </div>

            {/* Deep Rich "Add to Cart" Button */}
            <button
              type="button"
              onClick={handlePreviewAdd}
              disabled={stock <= 0}
              className={cn(
                'w-full rounded-xl py-2 font-util text-[0.68rem] uppercase tracking-[0.16em] transition-all shadow-xs',
                'bg-deep text-white border border-deep hover:bg-[#3D2A1E]',
                previewAdded && 'bg-emerald-600 border-emerald-600',
                stock <= 0 && 'opacity-50 cursor-not-allowed',
              )}
            >
              {previewAdded ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {/* Signature Gold "Buy Now" Button */}
            <button
              type="button"
              disabled={stock <= 0}
              className={cn(
                'w-full rounded-xl py-2 font-util text-[0.68rem] uppercase tracking-[0.16em] transition-all shadow-xs',
                'bg-gold text-white border border-gold hover:bg-gold-dk',
                stock <= 0 && 'opacity-50 cursor-not-allowed',
              )}
            >
              Buy Now
            </button>

            <div className="flex items-center justify-between font-util text-[0.58rem] text-ink-3 pt-1 border-t border-line-soft">
              <span>Ships from: <strong>Dev Creation</strong></span>
              <span>Sold by: <strong>Dev Creation Studio</strong></span>
            </div>
          </div>
        </article>
      ) : (
        /* ══════════════════════════════════════════════════════
           LUXURY STOREFRONT BOUTIQUE CARD
        ══════════════════════════════════════════════════════ */
        <article className="group flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover">
          <div className="relative block h-[330px] flex-shrink-0 overflow-hidden bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(currentImg.url)}
              alt={currentImg.alt || name || 'Product image'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                  el.src = '/assets/Logos/logo.jpeg';
                }
              }}
            />

            <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
              {offerBadge && (
                <span className="inline-flex items-center gap-1 rounded-full border border-flame/40 bg-flame/95 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                  <span>🔥</span> {offerBadge}
                </span>
              )}
              {hasDiscount && (
                <span className="inline-flex items-center rounded-full bg-deep/90 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-gold-lt shadow-sm backdrop-blur-xs">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : `Save ${formatRupee(calculatedSavings)}`}
                </span>
              )}
            </div>

            {(packType || weight) && (
              <span className="absolute right-3 top-3 z-10 rounded-full border border-gold/30 bg-white/95 px-2.5 py-0.5 font-util text-[0.58rem] font-semibold uppercase tracking-wider text-gold-dk shadow-xs backdrop-blur-md">
                🎁 {packType || weight}
              </span>
            )}

            {hasSlider && (
              <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-deep/20 px-2.5 py-1 backdrop-blur-xs">
                {displayImages.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveImg(i);
                    }}
                    aria-label={`Slide ${i + 1}`}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      activeImg === i ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/80',
                    )}
                  />
                ))}
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="font-util text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold">
                {type || 'Wax Sachet'}
              </span>
              <div className="flex items-baseline gap-1.5">
                {effectiveComparePrice && effectiveComparePrice > price && (
                  <span className="font-body text-xs text-ink-3 line-through">
                    {formatRupee(effectiveComparePrice)}
                  </span>
                )}
                <span className="font-body text-[0.95rem] font-semibold tabular-nums text-ink">
                  {formatRupee(price || 0)}
                </span>
              </div>
            </div>

            <div>
              {fragrance && (
                <div className="mb-1.5 inline-block rounded-md border border-line-soft bg-surface-2 px-2.5 py-0.5 font-body text-[0.8rem] text-ink-2">
                  Fragrance · <strong className="font-medium text-ink">{fragrance}</strong>
                </div>
              )}
              <h3 className="font-display-alt text-[1.38rem] font-medium leading-tight text-ink transition-colors duration-200 group-hover:text-gold-dk">
                {name || 'Product Title'}
              </h3>
            </div>

            <p className="line-clamp-2 text-[0.86rem] leading-relaxed text-body">
              {description || 'Product description will appear here as written...'}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))
              ) : (
                <>
                  <span className="tag-chip">100% Pure Soy</span>
                  <span className="tag-chip">Handcrafted</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handlePreviewAdd}
              disabled={stock <= 0}
              className={cn(
                'mt-auto inline-flex items-center justify-center gap-2 rounded-lg border py-3 text-center font-util text-[0.68rem] uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.98]',
                previewAdded
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                  : 'border-deep/30 bg-transparent text-ink hover:border-deep hover:bg-deep hover:text-white hover:shadow-[0_4px_14px_rgba(44,24,16,.18)]',
                stock <= 0 && 'cursor-not-allowed opacity-50',
              )}
            >
              {stock <= 0 ? 'Sold out' : previewAdded ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </article>
      )}
    </div>
  );
}

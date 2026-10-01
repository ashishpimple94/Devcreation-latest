'use client';

import { useState } from 'react';
import { formatRupee, cn } from '@/lib/utils';
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
 * Supports dual preview modes:
 * 1. "Amazon Style Preview": Recreates the exact Amazon product listing & Buy Box experience.
 * 2. "Storefront Card": The luxury boutique storefront card.
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
    ? images
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
                ? 'bg-[#232F3E] text-white shadow-xs'
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
           EXACT AMAZON-STYLE PRODUCT PREVIEW CARD & BUY BOX
        ══════════════════════════════════════════════════════ */
        <article className="rounded-xl border border-[#D5D9D9] bg-white p-4 shadow-sm text-[#0F1111] antialiased">
          {/* Top Brand & Badge */}
          <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-2">
            <span className="text-[0.68rem] font-semibold text-[#007185]">
              Brand: Dev Creation
            </span>
            <span className="inline-flex items-center rounded-xs bg-[#232F3E] text-white px-2 py-0.5 text-[0.6rem] font-bold">
              <span>Dev’s</span>&nbsp;<span className="text-[#F08804]">Choice</span>
            </span>
          </div>

          {/* Image + Slider */}
          <div className="relative mt-3 h-[240px] w-full overflow-hidden rounded-md border border-[#D5D9D9] bg-white flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImg.url}
              alt={currentImg.alt || name || 'Product image'}
              className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
            />

            {/* Amazon Deal Badge Overlay */}
            {hasDiscount && (
              <span className="absolute left-2 top-2 rounded bg-[#CC0C39] px-2 py-0.5 text-[0.6rem] font-bold uppercase text-white shadow-xs">
                {offerBadge || 'Limited time deal'}
              </span>
            )}

            {(packType || weight) && (
              <span className="absolute right-2 top-2 rounded border border-[#D5D9D9] bg-white/95 px-2 py-0.5 text-[0.6rem] font-bold text-[#0F1111] shadow-xs">
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
                    'h-10 w-10 flex-shrink-0 overflow-hidden rounded border p-0.5 bg-white',
                    activeImg === i ? 'border-[#E77600] ring-1 ring-[#E77600]' : 'border-[#D5D9D9] opacity-70',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Title & Ratings */}
          <div className="mt-3 space-y-1">
            <h3 className="text-sm font-normal text-[#0F1111] line-clamp-2 leading-snug">
              {name || 'Product Title'} — Handcrafted Botanical Aromatherapy Sachet
            </h3>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#FFA41C]">★★★★★</span>
              <span className="text-[#007185] font-semibold">4.8</span>
              <span className="text-[#565959]">(142)</span>
              <span className="text-[#565959]">· 50+ bought in past month</span>
            </div>
          </div>

          {/* Amazon Pricing Section */}
          <div className="mt-2.5 border-t border-[#E7E7E7] pt-2">
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="rounded bg-[#CC0C39] px-1.5 py-0.2 text-[0.62rem] font-bold uppercase text-white">
                  Deal
                </span>
                <span className="text-xs font-bold text-[#CC0C39]">
                  -{effectiveDiscount}%
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="text-xs align-super text-[#0F1111]">₹</span>
              <span className="text-2xl font-bold text-[#0F1111]">
                {(price || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#0F1111]">.00</span>
              {effectiveComparePrice && effectiveComparePrice > price && (
                <span className="text-xs text-[#565959] line-through ml-1">
                  M.R.P.: {formatRupee(effectiveComparePrice)}
                </span>
              )}
            </div>
            <p className="text-[0.68rem] text-[#565959]">Inclusive of all taxes</p>
          </div>

          {/* Delivery & Stock (Buy Box Sneak Peek) */}
          <div className="mt-2.5 rounded-lg border border-[#D5D9D9] p-2.5 text-[0.7rem] bg-[#FAFAFA] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#007600]">
                {stock > 0 ? '✓ In stock' : '✕ Out of stock'}
              </span>
              <span className="text-[#565959]">
                🚚 <strong>FREE delivery</strong> in 2-3 days
              </span>
            </div>

            {/* Amazon Yellow "Add to Cart" Button */}
            <button
              type="button"
              onClick={handlePreviewAdd}
              disabled={stock <= 0}
              className={cn(
                'w-full rounded-full py-2 text-xs font-semibold shadow-xs transition-all',
                'bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111]',
                previewAdded && 'bg-emerald-500 text-white border-emerald-500',
                stock <= 0 && 'opacity-50 cursor-not-allowed',
              )}
            >
              {previewAdded ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {/* Amazon Orange "Buy Now" Button */}
            <button
              type="button"
              disabled={stock <= 0}
              className={cn(
                'w-full rounded-full py-2 text-xs font-semibold shadow-xs transition-all',
                'bg-[#FFA41C] hover:bg-[#FA8900] border border-[#FF8F00] text-[#0F1111]',
                stock <= 0 && 'opacity-50 cursor-not-allowed',
              )}
            >
              Buy Now
            </button>

            <div className="flex items-center justify-between text-[0.62rem] text-[#565959] pt-1 border-t border-[#E7E7E7]">
              <span>Ships from: <strong>Dev Creation</strong></span>
              <span>Sold by: <strong>Dev Creation Official</strong></span>
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
              src={currentImg.url}
              alt={currentImg.alt || name || 'Product image'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
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

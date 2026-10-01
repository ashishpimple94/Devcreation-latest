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
 * Live Storefront Preview Card.
 * Renders the product with the exact same visual aesthetics, fonts, colors,
 * image slider, and offer badges as seen on the customer-facing storefront.
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

  const hasDiscount = (compareAtPrice && compareAtPrice > price) || discountPercent > 0;
  const calculatedSavings = compareAtPrice && compareAtPrice > price ? compareAtPrice - price : 0;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-dk">
          Live Storefront Card Preview
        </span>
        <span className="rounded-full bg-gold/10 px-2 py-0.5 font-util text-[0.55rem] font-medium text-gold-dk">
          Customer View
        </span>
      </div>

      <article className="group flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover">
        {/* Image Container with Slider & Badges */}
        <div className="relative block h-[330px] flex-shrink-0 overflow-hidden bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImg.url}
            alt={currentImg.alt || name || 'Product image'}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {/* Top-Left: Special Offer or Discount Pill */}
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

          {/* Top-Right: Pack / Gift Set Indicator */}
          {(packType || weight) && (
            <span className="absolute right-3 top-3 z-10 rounded-full border border-gold/30 bg-white/95 px-2.5 py-0.5 font-util text-[0.58rem] font-semibold uppercase tracking-wider text-gold-dk shadow-xs backdrop-blur-md">
              🎁 {packType || weight}
            </span>
          )}

          {/* Slider Pagination Dots */}
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

        {/* Content Body */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span className="font-util text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold">
              {type || 'Wax Sachet'}
            </span>
            <div className="flex items-baseline gap-1.5">
              {compareAtPrice && compareAtPrice > price && (
                <span className="font-body text-xs text-ink-3 line-through">
                  {formatRupee(compareAtPrice)}
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

          {/* Tags */}
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

          {/* Add to Cart Button Preview */}
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
            {stock <= 0 ? (
              'Sold out'
            ) : previewAdded ? (
              <>
                <span>✓</span>
                <span>Added to Cart</span>
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </article>
    </div>
  );
}

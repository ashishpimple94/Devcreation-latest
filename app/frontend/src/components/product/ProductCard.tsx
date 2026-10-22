'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupee, cn, resolveImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

/**
 * Premium Luxury E-Commerce Product Card matching pro editorial standards.
 * Features:
 * - Crisp studio backdrop with smooth hover zoom
 * - Responsive 1:1 image ratio
 * - Floating glassmorphic Wishlist heart button
 * - Clean dual-row information hierarchy:
 *    Row 1: Product Title (left) + Delicate Outlined Category/Type Tag Capsules (right)
 *    Row 2: Tabular Price with discount support (left) + Elegant Underlined "Add To Cart" action (right)
 * - Micro-animations on hover, click, and cart feedback
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const rawImages =
    product.images && product.images.length > 0
      ? product.images
      : [{ url: '/assets/Logos/Logo2.png', alt: product.name }];

  const images = rawImages.map((img) => ({
    ...img,
    url: resolveImageUrl(img.url),
  }));

  const hasSlider = images.length > 1;
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [isWishloading, setIsWishloading] = useState(false);

  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const toggleWishlist = useAuthStore((s) => s.toggleWishlist);
  const { success, error, info } = useToast();

  const isWishlisted = Boolean(user?.wishlist?.includes(product._id));

  // Category and Tag formatting for capsules matching the reference image: (Pillars Candle) (Tea Lights)
  const categoryName =
    typeof product.category === 'object' && product.category?.name
      ? product.category.name
      : product.type || '';

  const pillTags: string[] = [];
  if (categoryName) pillTags.push(categoryName);
  if (product.tags && product.tags.length > 0) {
    for (const tag of product.tags) {
      if (pillTags.length >= 2) break;
      if (!pillTags.includes(tag) && tag.length <= 16) {
        pillTags.push(tag);
      }
    }
  }

  // Auto-advance images smoothly if hovered
  useEffect(() => {
    if (!hasSlider || !isHovered) return;
    const timer = setInterval(() => {
      setActive((c) => (c + 1) % images.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [hasSlider, isHovered, images.length]);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      error('Please log in to add items to your cart');
      return;
    }
    try {
      await add(product._id, 1);
      setAdded(true);
      success(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 1400);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not add to cart');
    }
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      info('Please log in to save items to your wishlist');
      return;
    }

    try {
      setIsWishloading(true);
      const inWishlist = await toggleWishlist(product._id);
      if (inWishlist) {
        success('Added to your wishlist');
      } else {
        info('Removed from wishlist');
      }
    } catch {
      error('Failed to update wishlist');
    } finally {
      setIsWishloading(false);
    }
  };

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/products/${product.slug}`);
  };

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : product.discountPercent || 0;

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActive(0);
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line/60 bg-surface cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-gold/60 hover:shadow-[0_22px_50px_-20px_rgba(184,148,63,0.28)] will-change-transform"
    >
      {/* Product Image Stage */}
      <div className="relative block aspect-square w-full overflow-hidden bg-[#F7F6F3] shine-hover">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-full w-full focus:outline-none"
          tabIndex={-1}
        >
          {hasSlider ? (
            images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url + i}
                src={img.url}
                alt={img.alt ?? product.name}
                loading={priority && i === 0 ? 'eager' : 'lazy'}
                className={cn(
                  'absolute inset-0 h-full w-full object-contain p-4 sm:p-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]',
                  i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.includes('/assets/Logos/Logo2.png')) {
                    el.src = '/assets/Logos/Logo2.png';
                  }
                }}
              />
            ))
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0].url}
              alt={images[0].alt ?? product.name}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-contain p-2 sm:p-6 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes('/assets/Logos/Logo2.png')) {
                  el.src = '/assets/Logos/Logo2.png';
                }
              }}
            />
          )}

          {/* Soft ambient gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/25 via-deep/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        {/* Floating Badges (Top-Left) */}
        <div className="absolute left-2.5 sm:left-3.5 top-2.5 sm:top-3.5 z-10 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="rounded-full bg-deep px-2 py-0.5 sm:px-2.5 sm:py-1 font-util text-[0.55rem] sm:text-[0.62rem] font-bold uppercase tracking-wider text-white shadow-xs">
              Save {discountPercent}%
            </span>
          )}
          {product.isFeatured && discountPercent === 0 && (
            <span className="rounded-full bg-[#3D312A] px-2 py-0.5 sm:px-2.5 sm:py-1 font-util text-[0.55rem] sm:text-[0.62rem] font-medium uppercase tracking-wider text-white shadow-xs">
              Bestseller
            </span>
          )}
        </div>

        {/* Floating Wishlist Heart (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isWishloading}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute right-2.5 sm:right-3.5 top-2.5 sm:top-3.5 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-xs hover:scale-110 active:scale-90',
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-rose-200/50'
              : 'bg-white/85 text-ink-3 hover:bg-white hover:text-ink',
          )}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform duration-300', isWishlisted && 'scale-110')}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Mini Slider Dots */}
        {hasSlider && (
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-deep/20 px-2 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-xs">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(i);
                }}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  'h-1 sm:h-1.5 rounded-full transition-all duration-300 ease-spring',
                  i === active ? 'w-3 sm:w-4 bg-white shadow-xs' : 'w-1 sm:w-1.5 bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Info Section — Dual-Row Clean Pro Layout */}
      <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:gap-3 sm:p-5">
        {/* Row 1: Product Title (Left) + Outlined Category Tag Capsules (Right) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2.5">
          <h3 className="flex-1 font-display-alt text-[0.98rem] font-medium leading-snug text-ink transition-colors duration-200 group-hover:text-gold-dk sm:text-[1.28rem]">
            <Link href={`/products/${product.slug}`} className="line-clamp-1">
              {product.name}
            </Link>
          </h3>

          {/* Capsule Pills */}
          {pillTags.length > 0 && (
            <div className="flex flex-shrink-0 flex-wrap items-center gap-1 sm:justify-end sm:gap-1.5 pt-0.5">
              {pillTags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-neutral-300/80 bg-neutral-100/40 px-2 py-0.5 font-body text-[10px] sm:text-[11px] font-normal leading-normal text-neutral-600 transition-colors hover:border-neutral-400 hover:text-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Price (Left) + Underlined "Add To Cart" (Right) */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 sm:gap-3 sm:pt-1">
          {/* Price */}
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="font-body text-[0.92rem] font-semibold tabular-nums text-ink sm:text-[1.12rem]">
              {formatRupee(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-body text-[0.72rem] tabular-nums text-neutral-400 line-through sm:text-[0.82rem]">
                {formatRupee(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Interactive Add To Cart Button */}
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={cn(
              'group/btn relative overflow-hidden rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 font-body text-[0.72rem] font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-90 sm:text-[0.82rem]',
              product.stock <= 0
                ? 'cursor-not-allowed bg-neutral-100 text-neutral-400'
                : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100/60 text-ink hover:bg-deep hover:text-white hover:shadow-[0_8px_20px_-6px_rgba(44,24,16,0.35)] cursor-pointer',
            )}
          >
            {product.stock <= 0 ? (
              <span className="font-util text-[0.62rem] uppercase tracking-wider text-neutral-400 sm:text-[0.7rem]">Sold out</span>
            ) : added ? (
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Added</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Add To Cart</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

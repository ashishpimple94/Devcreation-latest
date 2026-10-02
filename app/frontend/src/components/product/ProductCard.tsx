'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRupee, cn, resolveImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

/** Product card faithfully ported from the original design, incl. the image slider. */
export function ProductCard({ product }: { product: Product }) {
  const images = (
    product.images && product.images.length
      ? product.images
      : [{ url: '/assets/Logos/logo.jpeg', alt: product.name }]
  ).map((img) => ({ ...img, url: resolveImageUrl(img.url) }));

  const hasSlider = images.length > 1;
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const user = useAuthStore((s) => s.user);
  const { success, error } = useToast();

  // Auto-advance the mini slider like the original card sliders.
  useEffect(() => {
    if (!hasSlider) return;
    const timer = setInterval(() => setActive((c) => (c + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [hasSlider, images.length]);

  const handleAdd = async () => {
    if (!user) {
      error('Please log in to add items to your cart');
      return;
    }
    try {
      await add(product._id, 1);
      setAdded(true);
      success('Added to cart');
      setTimeout(() => setAdded(false), 1100);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not add to cart');
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface transition-all duration-500 ease-spring hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-card-hover">
      <Link href={`/products/${product.slug}`} className="relative block h-[330px] flex-shrink-0 overflow-hidden bg-surface-2">
        {hasSlider ? (
          <>
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url + i}
                src={resolveImageUrl(img.url)}
                alt={img.alt ?? product.name}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]',
                  i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onError={(e) => {
                  const el = e.currentTarget;
                  if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                    el.src = '/assets/Logos/logo.jpeg';
                  }
                }}
              />
            ))}
            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-deep/20 px-2 py-1 backdrop-blur-xs">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(i);
                  }}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 ease-spring',
                    i === active ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/80',
                  )}
                />
              ))}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(images[0].url)}
            alt={images[0].alt ?? product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                el.src = '/assets/Logos/logo.jpeg';
              }
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="font-util text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold">{product.type}</span>
          <span className="font-body text-[0.94rem] font-semibold tabular-nums text-ink">{formatRupee(product.price)}</span>
        </div>

        <div>
          {product.fragrance && (
            <div className="mb-1.5 inline-block rounded-md bg-surface-2 px-2.5 py-0.5 font-body text-[0.8rem] text-ink-2 border border-line-soft">
              Fragrance · <strong className="font-medium text-ink">{product.fragrance}</strong>
            </div>
          )}
          <h3 className="font-display-alt text-[1.38rem] font-medium leading-tight text-ink transition-colors duration-200 group-hover:text-gold-dk">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>

        <p className="line-clamp-2 text-[0.86rem] leading-relaxed text-body">{product.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={cn(
            'mt-auto inline-flex items-center justify-center gap-2 rounded-lg border py-3 text-center font-util text-[0.68rem] uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.98]',
            added
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm animate-badge-pop'
              : 'border-deep/30 bg-transparent text-ink hover:border-deep hover:bg-deep hover:text-white hover:shadow-[0_4px_14px_rgba(44,24,16,.18)]',
            product.stock <= 0 && 'cursor-not-allowed opacity-50',
          )}
        >
          {product.stock <= 0 ? (
            'Sold out'
          ) : added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Added to Cart</span>
            </>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </article>
  );
}

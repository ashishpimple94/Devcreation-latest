'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRupee, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import type { Product } from '@/types';

/** Product card faithfully ported from the original design, incl. the image slider. */
export function ProductCard({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [{ url: '/assets/Logos/logo.jpeg', alt: product.name }];
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
    <article className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
      <Link href={`/products/${product.slug}`} className="group relative block h-[320px] flex-shrink-0 overflow-hidden bg-surface-2">
        {hasSlider ? (
          <>
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url + i}
                src={img.url}
                alt={img.alt ?? product.name}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
                  i === active ? 'opacity-100' : 'opacity-0',
                )}
              />
            ))}
            <div className="absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 gap-[5px]">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(i);
                  }}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    'h-[7px] rounded-full transition-all',
                    i === active ? 'w-[18px] rounded bg-white' : 'w-[7px] bg-white/45',
                  )}
                />
              ))}
            </div>
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0].url}
            alt={images[0].alt ?? product.name}
            className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="font-util text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold">{product.type}</div>
        <div className="flex items-start justify-between gap-3">
          <div>
            {product.fragrance && (
              <div className="mb-1 inline-block rounded bg-surface-2 px-2.5 py-1 font-body text-[0.82rem] text-ink-2">
                Fragrance - <strong className="font-medium text-ink">{product.fragrance}</strong>
              </div>
            )}
            <h3 className="mt-1 font-display-alt text-[1.4rem] font-medium leading-tight text-ink">
              <Link href={`/products/${product.slug}`}>{product.name}</Link>
            </h3>
          </div>
          <div className="whitespace-nowrap font-body text-[0.92rem] font-semibold tabular-nums text-ink">{formatRupee(product.price)}</div>
        </div>
        <p className="text-[0.88rem] leading-relaxed text-body">{product.description}</p>
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
            'mt-auto cursor-pointer border p-3 text-center font-util text-[0.64rem] uppercase tracking-[0.18em] transition-all',
            added
              ? 'border-gold bg-gold text-white'
              : 'border-line text-ink hover:border-deep hover:bg-deep hover:text-white',
            product.stock <= 0 && 'cursor-not-allowed opacity-50',
          )}
        >
          {product.stock <= 0 ? 'Sold out' : added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

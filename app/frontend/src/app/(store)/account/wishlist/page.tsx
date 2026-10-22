'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ErrorState } from '@/components/ui';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import type { Product } from '@/types';

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .get<Product[]>('/users/me/wishlist')
      .then((res) => setItems(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-dk">Account</p>
          <h1 className="font-display text-3xl font-medium text-ink">
            Wishlist
            {items.length > 0 && (
              <span className="ml-3 rounded-full bg-gold/15 px-2.5 py-0.5 font-util text-[0.7rem] font-bold text-gold-dk align-middle">
                {items.length}
              </span>
            )}
          </h1>
        </div>
        {items.length > 0 && (
          <Link href="/products" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 font-util text-xs uppercase tracking-wider text-ink-3 transition-all duration-200 hover:border-gold/50 hover:text-ink">
            Browse More
          </Link>
        )}
      </div>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-3xl">🤍</span>
          <div>
            <p className="font-display-alt text-xl font-medium text-ink">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-ink-3">Tap the ♡ on any product to save it here for later.</p>
          </div>
          <Link href="/products" className="btn-primary px-7 py-2.5 text-xs">Browse Products</Link>
        </div>
      ) : (
        <>
          {/* Hint strip */}
          <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gold">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <p className="text-[0.72rem] text-ink-3">
              {items.length} saved fragrance{items.length !== 1 ? 's' : ''} — tap the heart again to remove any time.
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}

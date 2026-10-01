'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState, ErrorState } from '@/components/ui';
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
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Wishlist</h1>
      {loading ? (
        <ProductGridSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="Your wishlist is empty" hint="Tap the heart on any product to save it here." action={<Link href="/products" className="btn-primary mt-2">Browse products</Link>} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

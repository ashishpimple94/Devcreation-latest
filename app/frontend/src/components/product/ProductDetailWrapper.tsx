'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductDetail } from '@/components/product/ProductDetail';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export function ProductDetailWrapper({
  initialProduct,
  initialRelated = [],
  slug,
}: {
  initialProduct: Product | null;
  initialRelated?: Product[];
  slug: string;
}) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [related, setRelated] = useState<Product[]>(initialRelated);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setRelated(initialRelated);
      setLoading(false);
      return;
    }

    // Dynamic client-side fetch if SSR was null or static export route
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      productService.getBySlug(slug),
      productService.related(slug).catch(() => []),
    ])
      .then(([prod, rel]) => {
        if (mounted) {
          setProduct(prod);
          setRelated(rel);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Product not found');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, initialProduct, initialRelated]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-[var(--pad)] py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image skeleton */}
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-neutral-200/60" />
          {/* Details skeleton */}
          <div className="flex flex-col gap-6 pt-4">
            <div className="h-4 w-28 animate-pulse rounded-full bg-neutral-200/60" />
            <div className="h-10 w-3/4 animate-pulse rounded-lg bg-neutral-200/60" />
            <div className="h-6 w-32 animate-pulse rounded-lg bg-neutral-200/60" />
            <div className="h-24 w-full animate-pulse rounded-xl bg-neutral-200/60" />
            <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-200/60" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-[var(--pad)] py-20 text-center">
        <span className="font-util text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#6B6547]">
          Dev Creation Fragrances
        </span>
        <h1 className="mt-3 font-display text-3xl font-medium text-ink sm:text-4xl">
          Product Details Unavailable
        </h1>
        <p className="mx-auto mt-3 max-w-md font-body text-[0.95rem] text-body">
          We couldn&apos;t load the details for this item right now. It may have been renamed or moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/products" className="btn-primary">
            Browse All Products
          </Link>
          <Link href="/" className="btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} related={related} />;
}

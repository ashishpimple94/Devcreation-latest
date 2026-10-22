'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { ErrorState, Skeleton } from '@/components/ui';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export function ProductEditClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  let id = (rawId && rawId !== 'edit' ? rawId : searchParams?.get('id')) || '';

  if (!id && typeof window !== 'undefined') {
    const sp = new URLSearchParams(window.location.search);
    const qId = sp.get('id') || sp.get('productId');
    if (qId) {
      id = qId;
    } else {
      const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
      if (match && match[1] && match[1] !== 'edit' && match[1] !== 'new') {
        id = decodeURIComponent(match[1]);
      }
    }
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!id) {
      setLoading(false);
      setError('No product specified. Please select a product to edit.');
      return;
    }
    setLoading(true);
    setError(null);
    productService
      .getBySlug(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load product'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Skeleton className="h-96 w-full rounded-xl" />;
  if (error || !product) return <ErrorState message={error ?? 'Not found'} onRetry={load} />;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-medium text-ink">Edit · {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

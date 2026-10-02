'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRupee, cn, resolveImageUrl } from '@/lib/utils';
import type { Product, PageMeta } from '@/types';

export default function AdminProductsPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);
    adminService
      .listProducts({ page, limit: 10, search: debouncedSearch || undefined })
      .then((res) => {
        setProducts(res.items);
        setMeta(res.meta);
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debouncedSearch]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminService.deleteProduct(deleteId);
      success('Product deleted');
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product & Fragrance',
      render: (p) => {
        const isPack =
          p.weight?.toLowerCase().includes('pack') ||
          p.type.toLowerCase().includes('set') ||
          p.name.toLowerCase().includes('set');

        return (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(p.images[0].url)}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                      el.src = '/assets/Logos/logo.jpeg';
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-ink-3">
                  No Pic
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs text-ink hover:text-gold cursor-pointer" onClick={() => router.push(`/products/${p._id}`)}>
                  {p.name}
                </span>
                {isPack && (
                  <span className="rounded bg-gold/15 px-1.5 py-0.2 font-util text-[0.55rem] font-bold text-gold-dk">
                    🎁 {p.weight || 'Gift Set'}
                  </span>
                )}
              </div>
              <span className="text-[0.7rem] text-ink-3">
                {p.fragrance ? `Fragrance: ${p.fragrance}` : p.type} · SKU: {p.sku}
              </span>
            </div>
          </div>
        );
      },
    },
    { key: 'type', header: 'Type', render: (p) => <span className="font-util text-xs text-ink-2">{p.type}</span> },
    {
      key: 'price',
      header: 'Offer & Price',
      render: (p) => {
        const hasDiscount = (p.compareAtPrice && p.compareAtPrice > p.price) || (p.discountPercent && p.discountPercent > 0);

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-body text-xs font-bold text-ink">{formatRupee(p.price)}</span>
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <span className="font-body text-[0.7rem] text-ink-3 line-through">
                  {formatRupee(p.compareAtPrice)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="inline-flex w-fit rounded bg-flame/15 px-1.5 py-0.2 font-util text-[0.55rem] font-bold text-flame">
                🔥 {p.discountPercent ? `${p.discountPercent}% OFF` : 'Special Offer'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <span
          className={cn(
            'font-util text-xs font-semibold',
            p.stock <= 5 ? 'text-red-600' : 'text-emerald-700',
          )}
        >
          {p.stock <= 0 ? 'Out of Stock' : `${p.stock} in stock`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-util text-[0.55rem] uppercase tracking-[0.12em]',
            p.isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-100 text-gray-500',
          )}
        >
          {p.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/products/${p._id}`)}
            className="rounded-lg border border-line bg-white px-2.5 py-1 font-util text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink hover:border-gold hover:text-gold-dk"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteId(p._id)}
            className="rounded-lg border border-line bg-white px-2 py-1 font-util text-[0.6rem] uppercase tracking-[0.1em] text-red-500 hover:border-red-300 hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-medium text-ink">Products</h1>
        <Link href="/products/new" className="btn-primary">
          + New product
        </Link>
      </div>

      <DataTable
        columns={columns}
        rows={products}
        loading={loading}
        error={errorMsg}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        emptyLabel="No products found"
        toolbar={
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          />
        }
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete product?"
        message="This permanently removes the product from the catalogue. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

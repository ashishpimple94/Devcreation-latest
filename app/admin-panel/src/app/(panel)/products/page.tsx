'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRupee, cn } from '@/lib/utils';
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
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-line bg-surface-2">
            {p.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <span className="font-medium text-ink">{p.name}</span>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-util text-xs">{p.sku}</span> },
    { key: 'type', header: 'Category', render: (p) => p.type },
    { key: 'price', header: 'Price', render: (p) => <span className="font-util text-xs">{formatRupee(p.price)}</span> },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => <span className={cn('font-util text-xs', p.stock <= 5 ? 'text-red-600' : 'text-ink')}>{p.stock}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span className={cn('rounded-full border px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em]', p.isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-500')}>
          {p.isActive ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex gap-3">
          <button onClick={() => router.push(`/products/${p._id}`)} className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-gold hover:text-gold-dk">
            Edit
          </button>
          <button onClick={() => setDeleteId(p._id)} className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-red-500 hover:underline">
            Delete
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

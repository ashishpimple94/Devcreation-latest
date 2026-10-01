'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { Product, PageMeta } from '@/types';

/** Inventory management: quick inline stock edits with low-stock highlighting. */
export default function AdminInventoryPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);
    adminService
      .listProducts({ page, limit: 10, search: debouncedSearch || undefined })
      .then((res) => {
        setProducts(res.items);
        setMeta(res.meta);
        setDrafts(Object.fromEntries(res.items.map((p) => [p._id, String(p.stock)])));
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debouncedSearch]);

  const saveStock = async (p: Product) => {
    const value = Number(drafts[p._id]);
    if (Number.isNaN(value) || value < 0) {
      error('Enter a valid stock quantity');
      return;
    }
    setSavingId(p._id);
    try {
      await adminService.updateProduct(p._id, { stock: value });
      success(`${p.name} stock updated`);
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product', render: (p) => <span className="font-medium text-ink">{p.name}</span> },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-util text-xs">{p.sku}</span> },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <input
          type="number"
          value={drafts[p._id] ?? ''}
          onChange={(e) => setDrafts((d) => ({ ...d, [p._id]: e.target.value }))}
          className={cn('w-24 rounded-lg border px-2 py-1 text-sm outline-none focus:border-gold', p.stock <= 5 ? 'border-red-300 bg-red-50' : 'border-line')}
        />
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (p) =>
        p.stock <= 5 ? (
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em] text-red-600">Low</span>
        ) : (
          <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em] text-green-700">OK</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <button
          onClick={() => saveStock(p)}
          disabled={savingId === p._id || drafts[p._id] === String(p.stock)}
          className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-gold hover:text-gold-dk disabled:opacity-40"
        >
          Save
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-medium text-ink">Inventory</h1>
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
    </div>
  );
}

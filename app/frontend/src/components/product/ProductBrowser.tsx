'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { EmptyState, ErrorState } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { productService, type ProductQuery } from '@/services/product.service';
import type { Category, Product, PageMeta } from '@/types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'popular', label: 'Most Popular' },
];

const PRICE_RANGES = [
  { label: 'All prices', min: undefined, max: undefined },
  { label: 'Under ₹500', min: undefined, max: 499 },
  { label: '₹500 – ₹700', min: 500, max: 700 },
  { label: 'Over ₹700', min: 701, max: undefined },
];

/**
 * Client-side product browser with server-side search, category + price
 * filtering, sorting and pagination. Search is debounced to avoid duplicate
 * requests.
 */
export function ProductBrowser({
  initialCategory,
  showFilters = true,
}: {
  initialCategory?: string;
  showFilters?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory ?? '');
  const [priceIdx, setPriceIdx] = useState(0);
  const [sort, setSort] = useState<NonNullable<ProductQuery['sort']>>('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    productService.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const range = PRICE_RANGES[priceIdx];
      const res = await productService.list({
        page,
        limit: 9,
        search: debouncedSearch || undefined,
        category: category || undefined,
        minPrice: range.min,
        maxPrice: range.max,
        sort,
      });
      setProducts(res.items);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, priceIdx, sort, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, priceIdx, sort]);

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrances…"
            className="min-w-[220px] flex-1 rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-[10px] border border-line bg-surface px-4 py-3 font-util text-[0.7rem] uppercase tracking-[0.1em] text-ink-2 outline-none focus:border-gold"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={priceIdx}
            onChange={(e) => setPriceIdx(Number(e.target.value))}
            className="rounded-[10px] border border-line bg-surface px-4 py-3 font-util text-[0.7rem] uppercase tracking-[0.1em] text-ink-2 outline-none focus:border-gold"
          >
            {PRICE_RANGES.map((r, i) => (
              <option key={r.label} value={i}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as NonNullable<ProductQuery['sort']>)}
            className="rounded-[10px] border border-line bg-surface px-4 py-3 font-util text-[0.7rem] uppercase tracking-[0.1em] text-ink-2 outline-none focus:border-gold"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton count={9} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : products.length === 0 ? (
        <EmptyState title="No products match your filters" hint="Try clearing the search or widening the price range." />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="btn-ghost px-4 py-2.5 disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'h-10 w-10 rounded-[10px] border font-util text-[0.72rem] transition-colors',
                    page === i + 1 ? 'border-deep bg-deep text-white' : 'border-line text-ink hover:border-gold',
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={page >= meta.totalPages}
                className="btn-ghost px-4 py-2.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

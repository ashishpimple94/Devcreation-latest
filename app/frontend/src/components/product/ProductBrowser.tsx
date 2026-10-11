'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { ScrollAnimate } from '@/components/ScrollAnimate';
import { EmptyState, ErrorState } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { productService, type ProductQuery } from '@/services/product.service';
import type { Category, Product, PageMeta } from '@/types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Alphabetical A–Z' },
  { value: 'popular', label: 'Most Popular' },
];

/**
 * Editorial Shop & Product Browser with category pill tabs,
 * debounced search, sort selector, and staggered scroll reveal animations.
 */
export function ProductBrowser({
  initialCategory,
  showTitle = true,
}: {
  initialCategory?: string;
  showTitle?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? '');
  const [sort, setSort] = useState<NonNullable<ProductQuery['sort']>>('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Load available categories
  useEffect(() => {
    productService
      .categories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        } else {
          // Curated aesthetic fallbacks matching store catalog & reference design
          setCategories([
            { _id: 'cat-jar', name: 'Jar Candle', slug: 'jar-candle', isActive: true },
            { _id: 'cat-party', name: 'Party Candles', slug: 'party-candles', isActive: true },
            { _id: 'cat-pillars', name: 'Pillars Candle', slug: 'pillars-candle', isActive: true },
            { _id: 'cat-tea', name: 'Tea Lights', slug: 'tea-lights', isActive: true },
            { _id: 'cat-melts', name: 'Wax Melts', slug: 'wax-melts', isActive: true },
          ]);
        }
      })
      .catch(() => {
        setCategories([
          { _id: 'cat-jar', name: 'Jar Candle', slug: 'jar-candle', isActive: true },
          { _id: 'cat-party', name: 'Party Candles', slug: 'party-candles', isActive: true },
          { _id: 'cat-pillars', name: 'Pillars Candle', slug: 'pillars-candle', isActive: true },
          { _id: 'cat-tea', name: 'Tea Lights', slug: 'tea-lights', isActive: true },
          { _id: 'cat-melts', name: 'Wax Melts', slug: 'wax-melts', isActive: true },
        ]);
      });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.list({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        sort,
      });
      setProducts(res.items);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sort, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to first page whenever filter criteria changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, sort]);

  return (
    <div className="w-full">
      {/* Editorial Centered Title */}
      {showTitle && (
        <ScrollAnimate direction="up" className="mb-6 text-center sm:mb-8">
          <h1 className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] font-medium tracking-tight text-ink">
            Shop
          </h1>
          <p className="mx-auto mt-2 max-w-[45ch] font-body text-[0.95rem] text-body">
            Handcrafted artisanal fragrances, soy candles and wax creations poured in small batches.
          </p>
        </ScrollAnimate>
      )}

      {/* Category Pills Row — Exact Match to Reference Design */}
      <ScrollAnimate direction="up" delay={80} className="mb-8 flex justify-center sm:mb-10">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {/* ALL Pill */}
          <button
            onClick={() => setSelectedCategory('')}
            className={cn(
              'rounded-full px-5 py-2 font-body text-[0.78rem] font-medium tracking-wide uppercase transition-all duration-300 active:scale-95 sm:px-6 sm:py-2.5 sm:text-[0.82rem]',
              selectedCategory === ''
                ? 'bg-[#6B6547] text-white shadow-md'
                : 'bg-[#F4EFE6] text-ink-2 hover:bg-[#EAE3D4] hover:text-ink',
            )}
          >
            All
          </button>

          {/* Dynamic Category Pills */}
          {categories.map((c) => {
            const isActive = selectedCategory === c._id || selectedCategory === c.slug;
            return (
              <button
                key={c._id}
                onClick={() => setSelectedCategory(isActive ? '' : c._id)}
                className={cn(
                  'rounded-full px-5 py-2 font-body text-[0.78rem] font-medium tracking-wide uppercase transition-all duration-300 active:scale-95 sm:px-6 sm:py-2.5 sm:text-[0.82rem]',
                  isActive
                    ? 'bg-[#6B6547] text-white shadow-md'
                    : 'bg-[#F4EFE6] text-ink-2 hover:bg-[#EAE3D4] hover:text-ink',
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </ScrollAnimate>

      {/* Minimalist Search & Sort Control Toolbar */}
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-5">
        {/* Search input with clean icon */}
        <div className="relative min-w-[260px] flex-1 sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrances, notes, collections…"
            className="w-full rounded-full border border-line bg-surface/80 py-2.5 pl-10 pr-10 text-[0.88rem] text-ink shadow-xs outline-none transition-all placeholder:text-neutral-400 focus:border-gold focus:bg-surface focus:ring-1 focus:ring-gold"
          />
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort and Counter */}
        <div className="flex items-center gap-3">
          {meta && (
            <span className="hidden font-util text-[0.72rem] uppercase tracking-wider text-neutral-500 sm:inline">
              {meta.total} {meta.total === 1 ? 'item' : 'items'}
            </span>
          )}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as NonNullable<ProductQuery['sort']>)}
              className="appearance-none rounded-full border border-line bg-surface/80 py-2 pl-4 pr-9 font-body text-[0.82rem] font-medium text-ink shadow-xs outline-none transition-colors hover:border-gold focus:border-gold cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Content with Staggered Scroll Animations */}
      {loading ? (
        <div className="mx-auto max-w-7xl">
          <ProductGridSkeleton count={6} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No fragrances found"
          hint="Try clearing your search query or selecting another category pill above."
          action={
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
              }}
              className="btn-primary mt-2"
            >
              View All Products
            </button>
          }
        />
      ) : (
        <div className="mx-auto max-w-7xl">
          {/* Pro 3-Column Layout with Staggered Animations */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {products.map((product, index) => (
              <ScrollAnimate
                key={product._id}
                direction="up"
                delay={(index % 3) * 110}
                className="h-full"
              >
                <ProductCard product={product} priority={index < 3} />
              </ScrollAnimate>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                disabled={page <= 1}
                className="btn-ghost px-5 py-2.5 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setPage(i + 1);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className={cn(
                    'h-10 w-10 rounded-full border font-util text-[0.76rem] font-medium transition-all',
                    page === i + 1
                      ? 'border-[#6B6547] bg-[#6B6547] text-white shadow-sm'
                      : 'border-line text-ink hover:border-gold bg-white',
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => {
                  setPage((p) => Math.min(p + 1, meta.totalPages));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                disabled={page >= meta.totalPages}
                className="btn-ghost px-5 py-2.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

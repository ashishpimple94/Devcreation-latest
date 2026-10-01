'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatRupee, cn } from '@/lib/utils';
import { Drawer } from '@/components/ui/Drawer';
import type { DashboardStats } from '@/types';

/**
 * "Top Product" panel — best sellers by units, styled as compact cards, with an
 * interactive slide-over Drawer providing in-depth product sales rankings,
 * unit volume, and revenue distribution.
 */
export function TopProduct({ stats }: { stats: DashboardStats }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const topProducts = stats.topProducts;
  const previewProducts = topProducts.slice(0, 4);

  const { totalUnitsSold, totalRevenue } = useMemo(() => {
    return topProducts.reduce(
      (acc, p) => ({
        totalUnitsSold: acc.totalUnitsSold + p.unitsSold,
        totalRevenue: acc.totalRevenue + p.revenue,
      }),
      { totalUnitsSold: 0, totalRevenue: 0 },
    );
  }, [topProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return topProducts;
    const q = searchQuery.toLowerCase();
    return topProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [topProducts, searchQuery]);

  const handleOpenDrawer = (productId?: string) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="flex h-full flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-sm">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(184,148,63,.1)] text-gold-dk">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 7L9 18l-5-5" />
                </svg>
              </span>
              <div>
                <h3 className="font-display text-lg text-ink">Top Product</h3>
                <p className="text-[0.7rem] text-ink-3">By units sold & revenue</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenDrawer()}
              className="flex items-center gap-1 rounded-full border border-line bg-surface-2 px-3 py-1 font-util text-[0.6rem] font-semibold uppercase tracking-wider text-ink-2 transition-all hover:border-gold hover:bg-white hover:text-ink"
              title="Open top products drawer"
            >
              <span>Breakdown</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </div>

          {previewProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">No sales yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {previewProducts.map((p, i) => (
                <button
                  key={p._id}
                  onClick={() => handleOpenDrawer(p._id)}
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-surface-2 p-4 text-left transition-all hover:border-gold hover:bg-white hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep font-util text-[0.6rem] font-semibold text-white shadow-xs">
                      #{i + 1}
                    </span>
                    <span className="font-util text-[0.55rem] uppercase text-ink-3 transition-colors group-hover:text-gold">
                      Details ↗
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="truncate text-sm font-medium text-ink group-hover:text-gold-dk">
                      {p.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[0.7rem] text-ink-3">{p.unitsSold} sold</span>
                      <span className="font-util text-[0.6rem] font-semibold text-gold-dk">
                        {formatRupee(p.revenue)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
          <button
            onClick={() => handleOpenDrawer()}
            className="font-util text-[0.6rem] uppercase tracking-[0.12em] text-copper transition-colors hover:text-deep"
          >
            View sales breakdown ({topProducts.length}) ↗
          </button>
          <Link
            href="/products"
            className="font-util text-[0.6rem] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-dk"
          >
            All products catalog →
          </Link>
        </div>
      </div>

      {/* Slide-over Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="lg"
        title="Top Selling Products Breakdown"
        subtitle="Rankings, unit volume & revenue performance"
        footer={
          <div className="flex items-center justify-between">
            <span className="font-util text-xs text-ink-3">
              {topProducts.length} high-performing products
            </span>
            <Link
              href="/products"
              className="btn-primary py-2 text-xs"
              onClick={() => setDrawerOpen(false)}
            >
              Manage Products
            </Link>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-line bg-white p-4">
              <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                Total Revenue
              </span>
              <p className="mt-1 font-util text-lg font-bold text-ink">
                {formatRupee(totalRevenue)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                Units Sold
              </span>
              <p className="mt-1 font-util text-lg font-bold text-ink">
                {totalUnitsSold}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                #1 Best Seller
              </span>
              <p className="mt-1 truncate font-util text-sm font-bold text-gold-dk">
                {topProducts[0]?.name ?? '—'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search top products…"
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-ink-3 hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Ranked Products List */}
          <div className="space-y-3">
            <h4 className="font-util text-[0.65rem] uppercase tracking-[0.16em] text-copper">
              Sales Ranking & Share
            </h4>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-3">
                No matching products found.
              </div>
            ) : (
              filteredProducts.map((p, idx) => {
                const rank = idx + 1;
                const share =
                  totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0;
                const avgPrice = p.unitsSold > 0 ? Math.round(p.revenue / p.unitsSold) : 0;
                const isSelected = selectedProductId === p._id;

                return (
                  <div
                    key={p._id}
                    onClick={() =>
                      setSelectedProductId(isSelected ? null : p._id)
                    }
                    className={cn(
                      'cursor-pointer rounded-2xl border bg-white p-4 transition-all',
                      isSelected
                        ? 'border-gold ring-1 ring-gold shadow-xs'
                        : 'border-line hover:border-gold/60',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-util text-xs font-bold text-white shadow-xs',
                            rank === 1
                              ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
                              : rank === 2
                              ? 'bg-gradient-to-br from-stone-400 to-stone-600'
                              : rank === 3
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                              : 'bg-deep',
                          )}
                        >
                          #{rank}
                        </span>

                        <div className="min-w-0">
                          <div className="truncate font-medium text-ink">{p.name}</div>
                          <div className="text-xs text-ink-3">
                            <span className="font-semibold text-ink-2">{p.unitsSold}</span> units
                            sold · Avg {formatRupee(avgPrice)}/unit
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-util text-sm font-semibold text-ink">
                          {formatRupee(p.revenue)}
                        </div>
                        <span className="mt-0.5 inline-block rounded-full bg-[rgba(184,148,63,.12)] px-2 py-0.5 font-util text-[0.55rem] font-semibold text-gold-dk">
                          {share}% share
                        </span>
                      </div>
                    </div>

                    {/* Revenue share bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-copper transition-all duration-500"
                        style={{ width: `${Math.min(share, 100)}%` }}
                      />
                    </div>

                    {/* Quick Action when clicked */}
                    {isSelected && (
                      <div className="mt-3.5 flex items-center justify-between border-t border-line-soft pt-3">
                        <span className="font-util text-[0.62rem] text-ink-3">
                          Product ID: {p._id}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/inventory"
                            className="rounded-lg border border-line px-2.5 py-1 font-util text-[0.6rem] uppercase tracking-wider text-ink-2 hover:border-gold hover:text-ink"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Inventory
                          </Link>
                          <Link
                            href="/products"
                            className="rounded-lg bg-deep px-2.5 py-1 font-util text-[0.6rem] uppercase tracking-wider text-white hover:bg-[#3D2A1E]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}

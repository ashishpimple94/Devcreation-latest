'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatRupee, formatDate, cn } from '@/lib/utils';
import { Drawer } from '@/components/ui/Drawer';
import type { DashboardStats, Order } from '@/types';

interface RegionData {
  name: string;
  revenue: number;
  share: number;
  orderCount: number;
  orders: Order[];
}

/**
 * "Top Market" panel — top shipping regions by revenue with an interactive
 * slide-over Drawer providing full geographical sales analytics and order lists.
 */
export function TopMarket({ stats }: { stats: DashboardStats }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { allRegions, totalRevenue } = useMemo(() => {
    const regionMap = new Map<string, { revenue: number; orders: Order[] }>();

    for (const o of stats.recentOrders) {
      const region = o.shippingAddress?.state?.trim() || 'Unknown';
      const existing = regionMap.get(region) ?? { revenue: 0, orders: [] };
      existing.revenue += o.total;
      existing.orders.push(o);
      regionMap.set(region, existing);
    }

    const total = [...regionMap.values()].reduce((s, v) => s + v.revenue, 0);

    const list: RegionData[] = [...regionMap.entries()]
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        share: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
        orderCount: data.orders.length,
        orders: data.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return { allRegions: list, totalRevenue: total };
  }, [stats.recentOrders]);

  const topRegions = allRegions.slice(0, 4);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return allRegions;
    const q = searchQuery.toLowerCase();
    return allRegions.filter((r) => r.name.toLowerCase().includes(q));
  }, [allRegions, searchQuery]);

  const handleOpenDrawer = (regionName?: string) => {
    if (regionName) {
      setSelectedRegion(regionName);
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20" />
                </svg>
              </span>
              <div>
                <h3 className="font-display text-lg text-ink">Top Market</h3>
                <p className="text-[0.7rem] text-ink-3">By state shipping revenue</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenDrawer()}
              className="flex items-center gap-1 rounded-full border border-line bg-surface-2 px-3 py-1 font-util text-[0.6rem] font-semibold uppercase tracking-wider text-ink-2 transition-all hover:border-gold hover:bg-white hover:text-ink"
              title="Open regional breakdown drawer"
            >
              <span>Breakdown</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </div>

          {topRegions.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">No regional data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topRegions.map((r) => (
                <button
                  key={r.name}
                  onClick={() => handleOpenDrawer(r.name)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-2.5 text-left transition-all hover:border-gold hover:bg-white hover:shadow-xs"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-copper font-util text-[0.6rem] font-semibold text-white shadow-xs">
                    {r.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate text-sm font-medium text-ink group-hover:text-gold-dk">
                      <span className="truncate">{r.name}</span>
                      <span className="text-[0.65rem] text-ink-3">({r.orderCount} ord)</span>
                    </div>
                    <div className="font-util text-[0.62rem] text-ink-3">{formatRupee(r.revenue)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 font-util text-[0.55rem] font-semibold',
                        r.share >= 40
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-[rgba(184,148,63,.12)] text-gold-dk',
                      )}
                    >
                      {r.share}%
                    </span>
                    <span className="text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-gold">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => handleOpenDrawer()}
          className="mt-4 block w-full border-t border-line-soft pt-3 text-center font-util text-[0.6rem] uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-dk"
        >
          View all regional markets ({allRegions.length}) →
        </button>
      </div>

      {/* Slide-over Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="lg"
        title="Top Markets & Regional Analytics"
        subtitle="Geographic breakdown across customer shipping destinations"
        footer={
          <div className="flex items-center justify-between">
            <span className="font-util text-xs text-ink-3">
              Total {allRegions.length} states/regions recorded
            </span>
            <Link
              href="/orders"
              className="btn-primary py-2 text-xs"
              onClick={() => setDrawerOpen(false)}
            >
              Go to Orders
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
                Active Markets
              </span>
              <p className="mt-1 font-util text-lg font-bold text-ink">
                {allRegions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                Top Market
              </span>
              <p className="mt-1 truncate font-util text-sm font-bold text-gold-dk">
                {allRegions[0]?.name ?? '—'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search region or state…"
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

          {/* Markets List */}
          <div className="space-y-3">
            <h4 className="font-util text-[0.65rem] uppercase tracking-[0.16em] text-copper">
              State / Region Breakdown
            </h4>

            {filteredRegions.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-ink-3">
                No matching regions found.
              </div>
            ) : (
              filteredRegions.map((region) => {
                const isSelected = selectedRegion === region.name;
                return (
                  <div
                    key={region.name}
                    className={cn(
                      'rounded-2xl border bg-white p-4 transition-all',
                      isSelected
                        ? 'border-gold ring-1 ring-gold shadow-xs'
                        : 'border-line hover:border-gold/60',
                    )}
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between gap-3"
                      onClick={() =>
                        setSelectedRegion(isSelected ? null : region.name)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-copper font-util text-xs font-bold text-white shadow-xs">
                          {region.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-medium text-ink">{region.name}</div>
                          <div className="text-xs text-ink-3">
                            {region.orderCount} {region.orderCount === 1 ? 'order' : 'orders'} · Avg{' '}
                            {formatRupee(Math.round(region.revenue / region.orderCount))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-util text-sm font-semibold text-ink">
                          {formatRupee(region.revenue)}
                        </div>
                        <span
                          className={cn(
                            'inline-block mt-0.5 rounded-full px-2 py-0.5 font-util text-[0.55rem] font-semibold',
                            region.share >= 40
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-[rgba(184,148,63,.12)] text-gold-dk',
                          )}
                        >
                          {region.share}% share
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-copper transition-all duration-500"
                        style={{ width: `${Math.min(region.share, 100)}%` }}
                      />
                    </div>

                    {/* Orders Accordion */}
                    {isSelected && (
                      <div className="mt-4 border-t border-line-soft pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                            Orders from {region.name}
                          </span>
                          <span className="text-[0.65rem] text-ink-3">
                            {region.orders.length} found
                          </span>
                        </div>

                        <div className="space-y-2">
                          {region.orders.map((order) => (
                            <Link
                              key={order._id}
                              href={`/orders/${order._id}`}
                              className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-2/60 p-2.5 text-xs transition-colors hover:border-gold hover:bg-white"
                            >
                              <div>
                                <span className="font-util font-semibold text-ink">
                                  {order.orderNumber}
                                </span>
                                <div className="text-[0.7rem] text-ink-3">
                                  {typeof order.user === 'object' ? order.user.name : 'Guest'} ·{' '}
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-util font-semibold text-ink">
                                  {formatRupee(order.total)}
                                </span>
                                <div className="font-util text-[0.6rem] uppercase text-gold-dk">
                                  {order.status}
                                </div>
                              </div>
                            </Link>
                          ))}
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

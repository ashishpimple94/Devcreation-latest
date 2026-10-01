'use client';

import { useMemo, useState } from 'react';
import { formatRupee, cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface DayPoint {
  dateStr: string;
  dayNum: string;
  dayName: string;
  month: string;
  fullDate: string;
  revenue: number;
  orders: number;
  heightPct: number;
  isPeak: boolean;
  delta: number;
}

/**
 * "Total Profit Overview" card — enhanced luxury graph bar with continuous
 * timeline tracking, Y-axis reference scale, background capsule tracks,
 * peak callouts, interactive hover states, and metric toggles.
 */
export function ProfitOverview({ stats }: { stats: DashboardStats }) {
  const [range, setRange] = useState<'7d' | '14d'>('14d');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const daysCount = range === '7d' ? 7 : 14;

  const { points, maxValue, totalRevenue, totalOrders, peakIndex } = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const item of stats.salesByDay) {
      const key = item._id.slice(0, 10);
      map.set(key, { revenue: item.revenue, orders: item.orders });
    }

    // Anchor to latest available order timestamp or today
    let latestTime = Date.now();
    if (stats.salesByDay.length > 0) {
      const dates = stats.salesByDay
        .map((d) => new Date(d._id).getTime())
        .filter((t) => !isNaN(t));
      if (dates.length > 0) {
        latestTime = Math.max(latestTime, ...dates);
      }
    }

    const pts: DayPoint[] = [];
    let totalRev = 0;
    let totalOrd = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(latestTime - i * 86400000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      const match = map.get(key) ?? { revenue: 0, orders: 0 };
      totalRev += match.revenue;
      totalOrd += match.orders;

      pts.push({
        dateStr: key,
        dayNum: String(d.getDate()),
        dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        fullDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        revenue: match.revenue,
        orders: match.orders,
        heightPct: 0,
        isPeak: false,
        delta: 0,
      });
    }

    // Determine scale ceiling
    const values = pts.map((p) => (metric === 'revenue' ? p.revenue : p.orders));
    const rawMax = Math.max(...values, 0);
    const step = rawMax > 5000 ? 1000 : rawMax > 1000 ? 500 : rawMax > 100 ? 100 : 5;
    const maxVal = rawMax === 0 ? (metric === 'revenue' ? 1000 : 10) : Math.ceil(rawMax / step) * step;

    let pIdx = -1;
    let maxFound = 0;
    for (let i = 0; i < pts.length; i++) {
      const val = metric === 'revenue' ? pts[i].revenue : pts[i].orders;
      if (val > maxFound) {
        maxFound = val;
        pIdx = i;
      }
    }

    for (let i = 0; i < pts.length; i++) {
      const val = metric === 'revenue' ? pts[i].revenue : pts[i].orders;
      pts[i].heightPct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
      pts[i].isPeak = i === pIdx && val > 0;

      if (i > 0) {
        const prevVal = metric === 'revenue' ? pts[i - 1].revenue : pts[i - 1].orders;
        if (prevVal > 0) {
          pts[i].delta = Math.round(((val - prevVal) / prevVal) * 100);
        } else if (val > 0) {
          pts[i].delta = 100;
        }
      }
    }

    return {
      points: pts,
      maxValue: maxVal,
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      peakIndex: pIdx,
    };
  }, [stats.salesByDay, daysCount, metric]);

  const activeDays = points.filter((p) => p.revenue > 0).length;
  const avgDaily = Math.round(totalRevenue / daysCount);
  const peakPoint = peakIndex >= 0 ? points[peakIndex] : null;

  // Comparison delta (first half vs second half of the selected range)
  const overallDelta = useMemo(() => {
    if (points.length < 2) return 0;
    const half = Math.floor(points.length / 2);
    const first = points.slice(0, half).reduce((s, d) => s + (metric === 'revenue' ? d.revenue : d.orders), 0);
    const second = points.slice(half).reduce((s, d) => s + (metric === 'revenue' ? d.revenue : d.orders), 0);
    if (first === 0) return second > 0 ? 100 : 0;
    return Math.round(((second - first) / first) * 100);
  }, [points, metric]);

  // Y-axis tick marks
  const yTicks = [
    { label: metric === 'revenue' ? formatRupee(maxValue) : String(maxValue), pct: 100 },
    { label: metric === 'revenue' ? formatRupee(Math.round(maxValue * 0.66)) : String(Math.round(maxValue * 0.66)), pct: 66 },
    { label: metric === 'revenue' ? formatRupee(Math.round(maxValue * 0.33)) : String(Math.round(maxValue * 0.33)), pct: 33 },
    { label: metric === 'revenue' ? '₹0' : '0', pct: 0 },
  ];

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(184,148,63,.15)] to-[rgba(193,127,62,.15)] text-gold-dk shadow-xs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 4 4 5-6" />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-lg font-medium text-ink">Total Profit & Sales Overview</h3>
            <p className="text-xs text-ink-3">Daily transaction activity and performance trends</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex items-center rounded-full border border-line bg-surface-2 p-0.5">
            <button
              onClick={() => setMetric('revenue')}
              className={cn(
                'rounded-full px-3 py-1 font-util text-[0.6rem] uppercase tracking-wider transition-all',
                metric === 'revenue'
                  ? 'bg-deep font-semibold text-white shadow-xs'
                  : 'text-ink-3 hover:text-ink',
              )}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={cn(
                'rounded-full px-3 py-1 font-util text-[0.6rem] uppercase tracking-wider transition-all',
                metric === 'orders'
                  ? 'bg-deep font-semibold text-white shadow-xs'
                  : 'text-ink-3 hover:text-ink',
              )}
            >
              Orders
            </button>
          </div>

          {/* Range Selector */}
          <div className="flex items-center rounded-full border border-line bg-surface-2 p-0.5">
            {(['7d', '14d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-full px-3 py-1 font-util text-[0.6rem] uppercase tracking-wider transition-all',
                  range === r
                    ? 'bg-gold font-semibold text-white shadow-xs'
                    : 'text-ink-3 hover:text-ink',
                )}
              >
                {r === '7d' ? '7 Days' : '14 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-util text-[0.62rem] uppercase tracking-[0.16em] text-copper">
            {range === '7d' ? 'Past 7 Days Total' : 'Past 14 Days Total'}
          </span>
          <div className="mt-0.5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {metric === 'revenue' ? formatRupee(totalRevenue) : `${totalOrders} Orders`}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-util text-xs font-semibold',
                overallDelta >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-600 border border-red-200',
              )}
            >
              {overallDelta >= 0 ? '▲ +' : '▼ '}
              {Math.abs(overallDelta)}%
            </span>
          </div>
        </div>

        {/* Quick Micro-Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-line-soft bg-surface-2/60 px-3 py-1.5">
            <span className="block font-util text-[0.55rem] uppercase tracking-wider text-ink-3">Daily Average</span>
            <span className="font-util text-xs font-semibold text-ink">
              {formatRupee(avgDaily)}/day
            </span>
          </div>
          {peakPoint && peakPoint.revenue > 0 && (
            <div className="rounded-xl border border-line-soft bg-surface-2/60 px-3 py-1.5">
              <span className="block font-util text-[0.55rem] uppercase tracking-wider text-ink-3">Peak Performance</span>
              <span className="font-util text-xs font-semibold text-gold-dk">
                {peakPoint.dayNum} {peakPoint.month} · {formatRupee(peakPoint.revenue)}
              </span>
            </div>
          )}
          <div className="rounded-xl border border-line-soft bg-surface-2/60 px-3 py-1.5">
            <span className="block font-util text-[0.55rem] uppercase tracking-wider text-ink-3">Active Sales Days</span>
            <span className="font-util text-xs font-semibold text-ink">
              {activeDays} of {daysCount} days
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Graph Bar Canvas */}
      <div className="relative mt-8">
        {/* Y-Axis Reference Guide Lines */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8">
          {yTicks.map((tick, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-14 text-right font-util text-[0.55rem] font-medium text-ink-3/70">
                {tick.label}
              </span>
              <div className="h-px flex-1 border-b border-dashed border-line-soft" />
            </div>
          ))}
        </div>

        {/* Bar Columns Container */}
        <div className="relative ml-16 flex h-64 items-end justify-between gap-1.5 pb-8 sm:gap-2 md:gap-3">
          {points.map((bar, i) => {
            const isHovered = hoveredIndex === i;
            const hasData = bar.revenue > 0;

            return (
              <div
                key={bar.dateStr}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="pointer-events-none absolute -top-16 z-30 flex flex-col items-center whitespace-nowrap rounded-xl border border-line bg-deep px-3 py-2 text-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <span className="font-util text-[0.55rem] uppercase tracking-wider text-gold-lt">
                      {bar.fullDate}
                    </span>
                    <span className="font-util text-xs font-bold text-white">
                      {formatRupee(bar.revenue)}
                    </span>
                    <span className="text-[0.6rem] text-stone-300">
                      {bar.orders} {bar.orders === 1 ? 'order' : 'orders'}
                    </span>
                    {/* Tooltip Arrow */}
                    <div className="absolute -bottom-1 h-2 w-2 rotate-45 bg-deep" />
                  </div>
                )}

                {/* Peak Pill Badge */}
                {bar.isPeak && !isHovered && (
                  <div className="pointer-events-none absolute -top-9 z-20 flex flex-col items-center whitespace-nowrap rounded-lg bg-deep px-2 py-0.5 shadow-md">
                    <span className="font-util text-[0.55rem] font-bold text-white">
                      {metric === 'revenue' ? formatRupee(bar.revenue) : `${bar.orders} ord`}
                    </span>
                    <div className="absolute -bottom-1 h-1.5 w-1.5 rotate-45 bg-deep" />
                  </div>
                )}

                {/* Growth Delta Tag */}
                {bar.delta !== 0 && !bar.isPeak && !isHovered && hasData && (
                  <span
                    className={cn(
                      'pointer-events-none absolute -top-6 rounded-full px-1.5 py-0.2 font-util text-[0.5rem] font-bold',
                      bar.delta > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-700',
                    )}
                  >
                    {bar.delta > 0 ? '+' : ''}
                    {bar.delta}%
                  </span>
                )}

                {/* Capsule Background Track */}
                <div
                  className={cn(
                    'relative flex w-full max-w-[42px] flex-1 items-end justify-center rounded-2xl border transition-all duration-200',
                    isHovered
                      ? 'border-gold/50 bg-[#F3EDE2] shadow-sm'
                      : 'border-line/40 bg-surface-2/60 hover:bg-surface-2',
                  )}
                >
                  {/* Filled Graph Bar */}
                  {hasData ? (
                    <div
                      className={cn(
                        'w-full rounded-xl transition-all duration-500 ease-out',
                        bar.isPeak
                          ? 'bg-gradient-to-t from-deep via-[#634832] to-gold shadow-md'
                          : isHovered
                          ? 'bg-gradient-to-t from-[#3D2A1E] via-copper to-gold'
                          : 'bg-gradient-to-t from-[#2C1810] via-copper/90 to-gold-lt',
                      )}
                      style={{ height: `${Math.max(bar.heightPct, 8)}%` }}
                    />
                  ) : (
                    /* Elegant baseline dot for zero days */
                    <div
                      className={cn(
                        'mb-1 h-1.5 w-1.5 rounded-full transition-colors',
                        isHovered ? 'bg-gold' : 'bg-line/60',
                      )}
                    />
                  )}
                </div>

                {/* X-Axis Date Labels */}
                <div className="mt-2.5 flex flex-col items-center">
                  <span
                    className={cn(
                      'font-util text-xs font-semibold transition-colors',
                      isHovered
                        ? 'text-gold-dk font-bold scale-105'
                        : hasData
                        ? 'text-ink font-bold'
                        : 'text-ink-3/70',
                    )}
                  >
                    {bar.dayNum}
                  </span>
                  <span className="font-util text-[0.55rem] uppercase tracking-wide text-ink-3/60">
                    {bar.dayName}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-line-soft pt-3 text-xs text-ink-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gold to-deep" />
            <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-2">Sales Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-surface-3 border border-line" />
            <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">No Orders</span>
          </div>
        </div>

        <p className="font-util text-[0.6rem] uppercase tracking-[0.14em] text-ink-3">
          Period Total:{' '}
          <span className="font-bold text-ink">
            {formatRupee(totalRevenue)} ({totalOrders} orders)
          </span>
        </p>
      </div>
    </div>
  );
}

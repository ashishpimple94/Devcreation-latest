'use client';

import { useMemo } from 'react';
import { formatRupee, cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const SEGMENTS = 18; // number of wedges in the fan
const GAP_DEG = 2.2; // gap between wedges
const INNER_R = 66;
const OUTER_R = 104;

/** Point on a circle centred at (cx,cy). Angle 0° = right, sweeps clockwise. */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Builds an SVG path for one tapered wedge between two radii and two angles. */
function wedgePath(cx: number, cy: number, startDeg: number, endDeg: number) {
  const p1 = polar(cx, cy, OUTER_R, startDeg);
  const p2 = polar(cx, cy, OUTER_R, endDeg);
  const p3 = polar(cx, cy, INNER_R, endDeg);
  const p4 = polar(cx, cy, INNER_R, startDeg);
  return `M ${p1.x} ${p1.y} A ${OUTER_R} ${OUTER_R} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${INNER_R} ${INNER_R} 0 0 0 ${p4.x} ${p4.y} Z`;
}

/**
 * "Sales Performance" gauge styled after the reference: a blooming fan of
 * tapered wedges filling in gold up to the sales-goal percentage (fulfilment =
 * delivered ÷ total orders), with Sales Number + Total Revenue stat boxes
 * (each with a % pill) and a dark alert banner.
 */
export function SalesGauge({ stats }: { stats: DashboardStats }) {
  const t = stats.totals;
  const pct = t.orders > 0 ? Math.round((t.completedOrders / t.orders) * 100) : 0;
  const filled = Math.round((pct / 100) * SEGMENTS);

  // Day-over-day deltas from the sales series (for the stat-box pills).
  const { ordersDelta, revenueDelta } = useMemo(() => {
    const s = stats.salesByDay;
    if (s.length < 2) return { ordersDelta: 0, revenueDelta: 0 };
    const a = s[s.length - 2];
    const b = s[s.length - 1];
    const d = (prev: number, cur: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));
    return { ordersDelta: d(a.orders, b.orders), revenueDelta: d(a.revenue, b.revenue) };
  }, [stats.salesByDay]);

  // Fan spans 180° across the top: from 180° (left) to 360° (right).
  const cx = 130;
  const cy = 120;
  const span = 180 / SEGMENTS;
  const wedges = Array.from({ length: SEGMENTS }).map((_, i) => {
    const start = 180 + i * span + GAP_DEG / 2;
    const end = 180 + (i + 1) * span - GAP_DEG / 2;
    return { path: wedgePath(cx, cy, start, end), on: i < filled };
  });

  return (
    <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(184,148,63,.1)] text-gold-dk">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
        </span>
        <h3 className="font-display text-lg text-ink">Sales Performance</h3>
      </div>

      {/* Fan gauge */}
      <div className="relative mx-auto mt-2">
        <svg width="260" height="140" viewBox="0 0 260 140">
          <defs>
            <linearGradient id="gaugeFill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#8C6F2A" />
              <stop offset="100%" stopColor="#D4B06A" />
            </linearGradient>
          </defs>
          {wedges.map((w, i) => (
            <path
              key={i}
              d={w.path}
              fill={w.on ? 'url(#gaugeFill)' : '#F0EAE0'}
              stroke="#fff"
              strokeWidth="1"
              className="transition-colors"
            />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <div className="font-display text-4xl font-medium text-ink">{pct}%</div>
          <div className="font-util text-[0.55rem] uppercase tracking-[0.16em] text-ink-3">Sales Goal</div>
        </div>
      </div>

      {/* Sub-stats with % pills */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatBox label="Sales Number" value={t.orders.toLocaleString('en-IN')} delta={ordersDelta} />
        <StatBox label="Total Revenue" value={formatRupee(t.revenue)} delta={revenueDelta} />
      </div>

      {/* Alert banner */}
      <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-deep px-4 py-3 text-white">
        <span className="text-gold-lt">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
        </span>
        <p className="flex-1 text-xs">
          {t.pendingOrders > 0
            ? `${t.pendingOrders} order${t.pendingOrders > 1 ? 's' : ''} awaiting your confirmation`
            : 'All orders are up to date'}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, delta }: { label: string; value: string; delta: number }) {
  const up = delta >= 0;
  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-util text-[0.55rem] uppercase tracking-[0.12em] text-ink-3">{label}</span>
        {delta !== 0 && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 font-util text-[0.5rem] font-semibold',
              up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
            )}
          >
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <div className="mt-1 font-display text-2xl font-medium text-ink">{value}</div>
    </div>
  );
}

'use client';

import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatRupee } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#F0A62C',
  confirmed: '#3B82F6',
  processing: '#6366F1',
  shipped: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
  refunded: '#9CA3AF',
};

/** Revenue+orders composed chart, order-status donut, and top-products bars. */
export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const t = stats.totals;

  const salesData = stats.salesByDay.map((d) => ({
    date: d._id.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const topData = stats.topProducts.map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 15) + '…' : p.name,
    units: p.unitsSold,
    revenue: p.revenue,
  }));

  const statusData = [
    { name: 'Pending', key: 'pending', value: t.pendingOrders },
    { name: 'Confirmed', key: 'confirmed', value: t.confirmedOrders },
    { name: 'Processing', key: 'processing', value: t.processingOrders },
    { name: 'Shipped', key: 'shipped', value: t.shippedOrders },
    { name: 'Delivered', key: 'delivered', value: t.completedOrders },
    { name: 'Cancelled', key: 'cancelled', value: t.cancelledOrders },
    { name: 'Refunded', key: 'refunded', value: t.refundedOrders },
  ].filter((s) => s.value > 0);

  const statusTotal = statusData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-5">
      {/* Revenue + orders trend */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg text-ink">Sales performance</h3>
            <p className="text-xs text-ink-3">Revenue and order volume · last 14 days</p>
          </div>
          <div className="flex items-center gap-4 font-util text-[0.6rem] uppercase tracking-[0.1em]">
            <span className="flex items-center gap-1.5 text-ink-3">
              <span className="h-2 w-2 rounded-full bg-gold" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-ink-3">
              <span className="h-2 w-2 rounded-full bg-copper" /> Orders
            </span>
          </div>
        </div>
        {salesData.length === 0 ? (
          <EmptyChart label="No sales in this period yet." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={salesData} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8943F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#B8943F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,20,16,.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5C4F46' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5C4F46' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5C4F46' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(28,20,16,.1)', fontSize: 12 }}
                formatter={(value: number, name) =>
                  name === 'revenue' ? [formatRupee(value), 'Revenue'] : [value, 'Orders']
                }
              />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#B8943F" strokeWidth={2} fill="url(#revFill)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#C17F3E" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status donut + top products */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-display text-lg text-ink">Order status</h3>
          {statusTotal === 0 ? (
            <EmptyChart label="No orders yet." />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">
                      {statusData.map((s) => (
                        <Cell key={s.key} fill={STATUS_COLORS[s.key]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(28,20,16,.1)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-medium text-ink">{statusTotal}</span>
                  <span className="font-util text-[0.5rem] uppercase tracking-[0.14em] text-ink-3">Orders</span>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5">
                {statusData.map((s) => (
                  <li key={s.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s.key] }} />
                      {s.name}
                    </span>
                    <span className="font-util text-xs text-ink">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-display text-lg text-ink">Top products</h3>
          {topData.length === 0 ? (
            <EmptyChart label="No product sales yet." />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart data={topData} layout="vertical" margin={{ left: 10, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(28,20,16,.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5C4F46' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#5C4F46' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(28,20,16,.1)', fontSize: 12 }}
                  formatter={(value: number, name) => (name === 'revenue' ? [formatRupee(value), 'Revenue'] : [value, 'Units'])}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="units" name="Units" fill="#C17F3E" radius={[0, 4, 4, 0]} barSize={14} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[210px] items-center justify-center rounded-xl bg-surface-2/50 text-sm text-ink-3">
      {label}
    </div>
  );
}

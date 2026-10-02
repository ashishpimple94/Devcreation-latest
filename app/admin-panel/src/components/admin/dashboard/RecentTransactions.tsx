'use client';

import Link from 'next/link';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatRupee, formatDateTime, resolveImageUrl } from '@/lib/utils';
import type { Order } from '@/types';

/** Recent transactions table with thumbnails, customer avatars and a CSV export. */
export function RecentTransactions({ orders }: { orders: Order[] }) {
  const fullAddress = (o: Order) => {
    const a = o.shippingAddress;
    if (!a) return '';
    return [a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ');
  };

  const exportCsv = () => {
    const rows = [
      ['Order ID', 'Product', 'Date', 'Customer', 'Phone', 'Delivery Address', 'Price', 'Status'],
      ...orders.map((o) => [
        o.orderNumber,
        o.items[0]?.name ?? '',
        formatDateTime(o.createdAt),
        typeof o.user === 'object' ? o.user.name : o.shippingAddress?.fullName ?? '',
        o.shippingAddress?.phone ?? '',
        fullAddress(o),
        String(o.total),
        o.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(184,148,63,.1)] text-gold-dk">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
          </span>
          <h3 className="font-display text-lg text-ink">Recent Transactions</h3>
        </div>
        <button
          onClick={exportCsv}
          disabled={orders.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-deep px-4 py-2 font-util text-[0.62rem] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#3D2A1E] disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-line-soft">
              {['Order ID', 'Product', 'Date & Time', 'Customer', 'Delivery Address', 'Price', 'Status'].map((h) => (
                <th key={h} className="px-6 py-3 font-util text-[0.55rem] uppercase tracking-[0.14em] text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-ink-3">No transactions yet.</td>
              </tr>
            ) : (
              orders.map((o) => {
                const item = o.items[0];
                const customer = typeof o.user === 'object' ? o.user.name : 'Customer';
                return (
                  <tr key={o._id} className="border-b border-line-soft transition-colors hover:bg-surface-2">
                    <td className="px-6 py-3">
                      <Link href={`/orders/${o._id}`} className="font-util text-xs font-semibold text-ink hover:text-gold-dk">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
                          {item?.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveImageUrl(item.image)}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (!el.src.includes('/assets/Logos/logo.jpeg')) {
                                  el.src = '/assets/Logos/logo.jpeg';
                                }
                              }}
                            />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-ink">{item?.name ?? '—'}</div>
                          <div className="text-[0.7rem] text-ink-3">{o.items.length} item(s)</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-ink-2">{formatDateTime(o.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-deep font-util text-[0.55rem] font-semibold text-white">
                          {customer.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm text-ink-2">{customer}</div>
                          {o.shippingAddress?.phone && (
                            <div className="text-[0.68rem] text-ink-3">{o.shippingAddress.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {o.shippingAddress ? (
                        <div className="flex items-start gap-1.5" title={fullAddress(o)}>
                          <span className="mt-0.5 flex-shrink-0 text-gold-dk">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <div className="min-w-0 max-w-[180px]">
                            <div className="truncate text-xs font-medium text-ink-2">
                              {o.shippingAddress.city}, {o.shippingAddress.state}
                            </div>
                            <div className="truncate text-[0.68rem] text-ink-3">
                              {o.shippingAddress.line1}
                              {o.shippingAddress.postalCode ? ` · ${o.shippingAddress.postalCode}` : ''}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-3">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 font-util text-xs text-ink">{formatRupee(o.total)}</td>
                    <td className="px-6 py-3"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

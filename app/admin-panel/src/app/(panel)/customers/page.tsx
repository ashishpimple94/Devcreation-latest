'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, formatRupee, cn } from '@/lib/utils';
import type { User, PageMeta } from '@/types';

type CustomerWithStats = User & { stats?: { orders: number; totalSpent: number } };

export default function AdminCustomersPage() {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Customer Profile Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);
    adminService
      .listCustomers({ page, limit: 10, search: debouncedSearch || undefined, status: status || undefined })
      .then((res) => {
        setCustomers(res.items);
        setMeta(res.meta);
      })
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [debouncedSearch, status]);

  const viewCustomerProfile = async (c: User) => {
    setSelectedCustomer(c);
    setDetailLoading(true);
    try {
      const full = await adminService.getCustomer(c._id);
      setSelectedCustomer(full);
    } catch {
      // fallback to basic customer object if stats fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleActive = async (c: User, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const updated = await adminService.setCustomerActive(c._id, !c.isActive);
      success(c.isActive ? 'Customer disabled' : 'Customer enabled');
      if (selectedCustomer && selectedCustomer._id === c._id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, isActive: updated.isActive } : null));
      }
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 font-display text-xs font-bold text-gold-dk">
            {c.name ? c.name[0].toUpperCase() : 'C'}
          </span>
          <span className="font-medium text-ink hover:text-gold cursor-pointer">{c.name}</span>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (c) => <span className="font-mono text-xs">{c.email}</span> },
    { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
    { key: 'joined', header: 'Joined', render: (c) => formatDate(c.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em]',
            c.isActive
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-600',
          )}
        >
          {c.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => viewCustomerProfile(c)}
            className="font-util text-[0.62rem] uppercase tracking-[0.1em] text-ink hover:text-gold font-semibold underline"
          >
            Profile
          </button>
          <button
            onClick={(e) => toggleActive(c, e)}
            className={cn(
              'font-util text-[0.6rem] uppercase tracking-[0.1em]',
              c.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800',
            )}
          >
            {c.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Customers</h1>
          <p className="mt-1 text-xs text-ink-3">View and manage registered customers and their profile activity.</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={customers}
        loading={loading}
        error={errorMsg}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        onRowClick={viewCustomerProfile}
        emptyLabel="No customers found"
        toolbar={
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or email…"
              className="min-w-[240px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-line bg-white px-3 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] outline-none focus:border-gold"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
            </select>
          </>
        }
      />

      {/* Customer Profile Modal */}
      <Modal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        className="max-w-lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3.5">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 font-display text-2xl font-bold text-gold-dk">
                  {selectedCustomer.name ? selectedCustomer.name[0].toUpperCase() : 'C'}
                </span>
                <div>
                  <h2 className="font-display text-xl font-medium text-ink">{selectedCustomer.name}</h2>
                  <span className="font-util text-[0.6rem] uppercase tracking-[0.12em] text-copper">
                    {selectedCustomer.role === 'customer' ? 'Customer Profile' : selectedCustomer.role}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em]',
                  selectedCustomer.isActive
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-600',
                )}
              >
                {selectedCustomer.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            {/* Lifetime Stats */}
            <div>
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                Customer Activity Overview
              </span>
              {detailLoading ? (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                    <span className="block text-[0.65rem] uppercase tracking-wider text-ink-3">Orders</span>
                    <span className="mt-1 block font-display text-xl font-bold text-ink">
                      {selectedCustomer.stats?.orders ?? 0}
                    </span>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                    <span className="block text-[0.65rem] uppercase tracking-wider text-ink-3">Total Spent</span>
                    <span className="mt-1 block font-display text-lg font-bold text-gold-dk">
                      {formatRupee(selectedCustomer.stats?.totalSpent ?? 0)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                    <span className="block text-[0.65rem] uppercase tracking-wider text-ink-3">Avg Order</span>
                    <span className="mt-1 block font-display text-lg font-bold text-ink">
                      {formatRupee(
                        selectedCustomer.stats?.orders && selectedCustomer.stats?.orders > 0
                          ? Math.round((selectedCustomer.stats?.totalSpent ?? 0) / selectedCustomer.stats.orders)
                          : 0,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Contact Details */}
            <div className="space-y-3 rounded-xl border border-line bg-surface-2/60 p-4 text-xs">
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                Contact & Account Information
              </span>

              <div className="flex items-center justify-between border-b border-line-soft py-1.5">
                <span className="text-ink-3">Email Address:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-ink font-semibold">{selectedCustomer.email}</span>
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="rounded bg-gold/15 px-1.5 py-0.5 text-[0.65rem] text-gold-dk hover:underline"
                  >
                    ✉️ Send Email
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-line-soft py-1.5">
                <span className="text-ink-3">Phone Number:</span>
                {selectedCustomer.phone ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-ink">{selectedCustomer.phone}</span>
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="rounded bg-gold/15 px-1.5 py-0.5 text-[0.65rem] text-gold-dk hover:underline"
                    >
                      📞 Call
                    </a>
                  </div>
                ) : (
                  <span className="text-ink-3 italic">Not provided</span>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-line-soft py-1.5">
                <span className="text-ink-3">Registered On:</span>
                <span className="text-ink">{formatDate(selectedCustomer.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-ink-3">User ID:</span>
                <span className="font-mono text-[0.68rem] text-ink-3">{selectedCustomer._id}</span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Link
                href={`/orders?search=${encodeURIComponent(selectedCustomer.email)}`}
                className="rounded-lg border border-deep bg-deep px-3.5 py-2 font-util text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#3D2A1E]"
                onClick={() => setSelectedCustomer(null)}
              >
                View Customer Orders →
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(selectedCustomer)}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-util text-xs uppercase tracking-wider',
                    selectedCustomer.isActive
                      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
                  )}
                >
                  {selectedCustomer.isActive ? 'Disable Account' : 'Enable Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg border border-line bg-white px-3 py-2 font-util text-xs uppercase tracking-wider text-ink-2 hover:bg-surface-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

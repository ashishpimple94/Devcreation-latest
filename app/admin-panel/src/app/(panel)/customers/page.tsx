'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate, cn } from '@/lib/utils';
import type { User, PageMeta } from '@/types';

export default function AdminCustomersPage() {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta>();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

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

  const toggleActive = async (c: User) => {
    try {
      await adminService.setCustomerActive(c._id, !c.isActive);
      success(c.isActive ? 'Customer disabled' : 'Customer enabled');
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const columns: Column<User>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-ink">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c) => c.email },
    { key: 'phone', header: 'Phone', render: (c) => c.phone ?? '—' },
    { key: 'joined', header: 'Joined', render: (c) => formatDate(c.createdAt) },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <span className={cn('rounded-full border px-2.5 py-1 font-util text-[0.55rem] uppercase tracking-[0.12em]', c.isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600')}>
          {c.isActive ? 'Active' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <button onClick={() => toggleActive(c)} className="font-util text-[0.6rem] uppercase tracking-[0.1em] text-gold hover:text-gold-dk">
          {c.isActive ? 'Disable' : 'Enable'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-medium text-ink">Customers</h1>
      <DataTable
        columns={columns}
        rows={customers}
        loading={loading}
        error={errorMsg}
        meta={meta}
        onPageChange={setPage}
        onRetry={load}
        emptyLabel="No customers found"
        toolbar={
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2 font-util text-[0.65rem] uppercase tracking-[0.1em] outline-none focus:border-gold">
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Disabled</option>
            </select>
          </>
        }
      />
    </div>
  );
}

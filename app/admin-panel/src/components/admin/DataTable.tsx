'use client';

import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PageMeta } from '@/types';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

/**
 * Reusable admin table with loading skeletons, empty/error states, responsive
 * horizontal scroll and server-side pagination controls. Sorting/filtering are
 * driven by the parent (server-side) via the toolbar slot.
 */
export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  loading,
  error,
  meta,
  onPageChange,
  emptyLabel = 'No records found',
  toolbar,
  onRetry,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: string | null;
  meta?: PageMeta;
  onPageChange?: (page: number) => void;
  emptyLabel?: string;
  toolbar?: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">{toolbar}</div>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 font-util text-[0.6rem] uppercase tracking-[0.14em] text-ink-3', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-line-soft">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  {onRetry && (
                    <button onClick={onRetry} className="btn-ghost mt-3">
                      Try again
                    </button>
                  )}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-ink-3">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id} className="border-b border-line-soft transition-colors hover:bg-surface-2">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-4 text-sm text-ink-2', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <span className="font-util text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              className="rounded-lg border border-line px-3 py-1.5 font-util text-[0.65rem] uppercase tracking-[0.1em] text-ink-2 disabled:opacity-40 hover:border-gold"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="rounded-lg border border-line px-3 py-1.5 font-util text-[0.65rem] uppercase tracking-[0.1em] text-ink-2 disabled:opacity-40 hover:border-gold"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

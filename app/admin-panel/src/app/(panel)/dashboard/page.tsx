'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { ProfitOverview } from '@/components/admin/dashboard/ProfitOverview';
import { SalesGauge } from '@/components/admin/dashboard/SalesGauge';
import { RecentTransactions } from '@/components/admin/dashboard/RecentTransactions';
import { TopMarket } from '@/components/admin/dashboard/TopMarket';
import { TopProduct } from '@/components/admin/dashboard/TopProduct';
import { ErrorState, Skeleton } from '@/components/ui';
import { useSocket } from '@/hooks/useSocket';
import type { DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    adminService
      .dashboard()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  // Live refresh when the backend signals data changed (new order, status update…).
  useSocket({ onDashboardUpdate: load, onAdminNotification: load });

  if (loading) return <DashboardSkeleton />;
  if (error || !stats) return <ErrorState message={error ?? 'No data'} onRetry={load} />;

  return (
    <div className="w-full space-y-6">
      {/* Row 1: Profit overview + Sales gauge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfitOverview stats={stats} />
        </div>
        <div className="lg:col-span-1">
          <SalesGauge stats={stats} />
        </div>
      </div>

      {/* Row 2: Top Market & Top Product (50% / 50% split across 100% of the screen) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopMarket stats={stats} />
        <TopProduct stats={stats} />
      </div>

      {/* Row 3: Recent Transactions (100% full width table) */}
      <div className="w-full">
        <RecentTransactions orders={stats.recentOrders} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-3xl lg:col-span-2" />
        <Skeleton className="h-96 w-full rounded-3xl lg:col-span-1" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { adminService } from '@/services/admin.service';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
  badgeKey?: 'orders' | 'products' | 'reports';
}

const MENU: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <IconGrid />, roles: ['super_admin', 'admin'] },
  { href: '/products', label: 'Products', icon: <IconBox />, badgeKey: 'products' },
  { href: '/orders', label: 'Orders & Invoices', icon: <IconBag />, badgeKey: 'orders' },
  { href: '/gift-cards', label: 'Gift Cards & Codes', icon: <IconTicket /> },
  { href: '/customers', label: 'Customer Insights', icon: <IconUsers />, roles: ['super_admin', 'admin'] },
  { href: '/inventory', label: 'Inventory', icon: <IconStack /> },
  { href: '/notifications', label: 'Notifications', icon: <IconBell />, badgeKey: 'reports' },
];

const OTHERS: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: <IconGear /> },
  { href: '/team', label: 'Team Members', icon: <IconTeam /> },
  { href: '/help', label: 'Help Center', icon: <IconHelp /> },
];

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'https://devcreation24.in';

/**
 * Admin shell styled after the reference SaaS dashboard: a soft gradient app
 * canvas with a floating rounded shell, a sectioned sidebar (MENU / OTHERS)
 * with count badges + a pinned profile, and a top bar with search, actions and
 * an avatar cluster — all in the Dev Creation gold/cream palette.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { success } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<{ orders: number; products: number; reports: number }>({
    orders: 0,
    products: 0,
    reports: 0,
  });

  const role = user?.role;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Pull small live counts for the sidebar badges (admins only — endpoint is admin-scoped).
  useEffect(() => {
    if (role !== 'super_admin' && role !== 'admin') return;
    adminService
      .dashboard()
      .then((s) =>
        setBadges({
          orders: s.totals.pendingOrders,
          products: s.totals.lowStockProducts,
          reports: 0,
        }),
      )
      .catch(() => {});
  }, [role]);

  const onLogout = async () => {
    await logout();
    success('Signed out');
    router.push('/login');
  };

  const renderNav = (items: NavItem[]) =>
    items
      .filter((item) => !item.roles || (role && item.roles.includes(role)))
      .map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        const badge = item.badgeKey ? badges[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-deep text-white shadow-sm' : 'text-ink-2 hover:bg-surface-2',
            )}
          >
            <span className={cn('flex-shrink-0', active ? 'text-gold-lt' : 'text-ink-3')}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5 font-util text-[0.6rem] font-semibold text-white">
                {badge}
              </span>
            )}
          </Link>
        );
      });

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Store switcher */}
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-deep text-white">
          <Image src="/assets/Logos/logo.jpeg" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink">Dev Creation</span>
            <span className="rounded bg-[rgba(184,148,63,.12)] px-1.5 py-0.5 font-util text-[0.5rem] font-semibold uppercase tracking-wide text-gold-dk">
              Pro
            </span>
          </div>
          <span className="font-util text-[0.55rem] uppercase tracking-[0.14em] text-ink-3">Admin Console</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="px-4 pb-2 pt-5">
        <h2 className="font-display-alt text-2xl font-medium leading-tight text-ink">
          Welcome back,
          <br />
          {firstName} <span className="align-middle">👋</span>
        </h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-2 pt-3 font-util text-[0.55rem] uppercase tracking-[0.18em] text-ink-3">Menu</p>
        <div className="space-y-1">{renderNav(MENU)}</div>
        <p className="px-3 pb-2 pt-5 font-util text-[0.55rem] uppercase tracking-[0.18em] text-ink-3">Others</p>
        <div className="space-y-1">{renderNav(OTHERS)}</div>
        <div className="mt-1">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="text-ink-3"><IconLogout /></span>
            Logout
          </button>
        </div>
      </nav>

      {/* Profile */}
      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold font-util text-[0.6rem] font-semibold text-white">
          {(user?.name ?? 'DC').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink">{user?.name}</div>
          <div className="truncate text-[0.7rem] text-ink-3">{user?.email}</div>
        </div>
        <a href={STOREFRONT_URL} target="_blank" rel="noopener" title="View store" className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-2 hover:text-ink">
          <IconExternal />
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f8f5ee]">
      <div className="flex min-h-screen w-full">
        {/* Sidebar — flush edge-to-edge sticky on desktop, drawer on mobile */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-[70] w-72 border-r border-line bg-white shadow-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-shrink-0 lg:shadow-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          {sidebar}
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main shell — 100% width and height fit */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar — sticky header */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/85 px-4 py-3 backdrop-blur-md lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-ink-2 hover:bg-surface-2 lg:hidden"
              aria-label="Open menu"
            >
              <IconMenu />
            </button>

            <label className="flex flex-1 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-2">
              <IconSearch />
              <input
                placeholder="Search orders, products, customers…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="hidden rounded border border-line bg-white px-1.5 py-0.5 font-util text-[0.55rem] text-ink-3 sm:inline">⌘S</kbd>
            </label>

            <AdminNotificationCenter />

            <div className="hidden items-center sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-copper font-util text-[0.55rem] font-semibold text-white">DC</span>
              <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gold font-util text-[0.55rem] font-semibold text-white">
                {(user?.name ?? 'AD').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>

            <button className="btn-primary hidden px-4 py-2 sm:inline-flex">Invite</button>
          </header>

          {/* Content — fills full width and height */}
          <main className="flex-1 p-4 lg:p-8 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* icons */
function IconGrid() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>; }
function IconBag() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 01-8 0" /></svg>; }
function IconBox() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16Z" /><path d="M3.3 7l8.7 5 8.7-5" /><path d="M12 22V12" /></svg>; }
function IconStack() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>; }
function IconUsers() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>; }
function IconBell() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>; }
function IconGear() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>; }
function IconTeam() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>; }
function IconHelp() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>; }
function IconLogout() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>; }
function IconMenu() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>; }
function IconSearch() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function IconExternal() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6M10 14L21 3" /></svg>; }
function IconTicket() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>; }

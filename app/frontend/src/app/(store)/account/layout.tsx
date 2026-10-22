'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { cn } from '@/lib/utils';

const LINKS = [
  {
    href: '/account/profile',
    label: 'Profile',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/account/orders',
    label: 'My Orders',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: '/account/wishlist',
    label: 'Wishlist',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/account/notifications',
    label: 'Notifications',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetCart = useCartStore((s) => s.reset);
  const resetNotifications = useNotificationStore((s) => s.reset);

  const initials = useMemo(() => {
    if (!user?.name) return 'DC';
    return user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }, [user?.name]);

  const onLogout = async () => {
    await logout();
    resetCart();
    resetNotifications();
    router.push('/');
  };

  return (
    <RequireAuth>
      <section className="grid grid-cols-1 gap-8 px-[var(--pad)] py-[clamp(40px,6vh,80px)] lg:grid-cols-[260px_1fr]">

        {/* ── Sidebar ── */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">

          {/* Profile strip */}
          <div className="relative overflow-hidden bg-gradient-to-br from-deep via-[#3D2A1E] to-copper px-5 py-5">
            {/* Subtle radial glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative flex items-center gap-3.5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/90 font-util text-base font-bold text-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)] ring-2 ring-white/20">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-deep bg-emerald-400" />
              </div>
              {/* Name + role */}
              <div className="min-w-0">
                <p className="truncate font-display-alt text-[1.05rem] font-semibold leading-tight text-white">
                  {user?.name ?? 'Welcome back'}
                </p>
                <p className="font-util text-[0.58rem] uppercase tracking-[0.18em] text-gold-lt/80">
                  Fragrance Member
                </p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-0.5 p-2">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ease-spring',
                    active
                      ? 'bg-deep text-white shadow-xs'
                      : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                  )}
                >
                  {/* Icon container */}
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
                    active ? 'bg-white/15 text-gold-lt' : 'bg-surface-2 text-ink-3 group-hover:bg-gold/10 group-hover:text-gold-dk',
                  )}>
                    {link.icon}
                  </span>
                  <span className="font-util text-[0.7rem] font-semibold uppercase tracking-[0.12em]">
                    {link.label}
                  </span>
                  {active && (
                    <svg className="ml-auto h-3.5 w-3.5 text-gold-lt shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Shop + Logout footer */}
          <div className="border-t border-line-soft p-2">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/8 py-2.5 px-3 font-util text-[0.68rem] font-bold uppercase tracking-wider text-gold-dk transition-all duration-200 hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-md active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>Shop Collection</span>
            </Link>

            <button
              onClick={onLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 hover:bg-red-50 group"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 group-hover:bg-red-100 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span className="font-util text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-red-500 group-hover:text-red-600">
                Sign out
              </span>
            </button>
          </div>
        </aside>

        <div>{children}</div>
      </section>
    </RequireAuth>
  );
}

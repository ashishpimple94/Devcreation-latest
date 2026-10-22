'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { MobileNav } from '@/components/layout/MobileNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

export const NAV_LINKS = [
  { label: 'Collection', href: '/products' },
  { label: 'Care', href: '/#care' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Contact', href: '/contact' },
  { label: 'Gifting', href: '/categories/gift-sets' },
  { label: 'Refills', href: '/categories/wax-melts' },
];

const ACCOUNT_MENU = [
  {
    href: '/account/profile',
    label: 'My Profile',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/account/orders',
    label: 'My Orders',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: '/account/wishlist',
    label: 'Wishlist',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    href: '/account/addresses',
    label: 'Addresses',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

/** Sticky header with centered nav, animated profile avatar dropdown, and smooth scroll elevation. */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const count = useCartStore((s) => s.count);
  const openCart = useCartStore((s) => s.open);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetCart = useCartStore((s) => s.reset);
  const resetNotifications = useNotificationStore((s) => s.reset);
  const unread = useNotificationStore((s) => s.unread);

  const initials = user?.name
    ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
    : '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close avatar menu on outside click or Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const hashId = href.substring(2);
      const target = document.getElementById(hashId);
      if (pathname === '/') {
        e.preventDefault();
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', href);
        }
      }
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    resetCart();
    resetNotifications();
    router.push('/');
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[60] flex items-center justify-between gap-6 px-[var(--pad)] py-[10px] transition-all duration-300 ease-spring backdrop-blur-[16px]',
          scrolled
            ? 'border-b border-gold/25 bg-paper/95 shadow-[0_8px_30px_-10px_rgba(44,24,16,.08)]'
            : 'border-b border-line bg-paper/95',
        )}
      >
        {/* Logo */}
        <Link href="/" prefetch aria-label="Dev Creation Home" className="flex flex-shrink-0 items-center leading-none">
          <Image
            src="/assets/Logos/Logo2.png"
            alt="Dev Creation Luxury Fragrance Logo"
            width={72}
            height={72}
            priority
            unoptimized
            className="h-16 w-16 object-contain rounded-full max-[860px]:h-13 max-[860px]:w-13 transition-transform duration-200 hover:scale-105"
          />
        </Link>

        {/* Centered Nav */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 min-[861px]:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/products'
                ? pathname === '/products'
                : link.href !== '/#care' && pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                prefetch
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'group relative whitespace-nowrap font-body text-[0.82rem] font-medium uppercase tracking-[0.1em] transition-colors',
                  isActive ? 'text-ink font-semibold' : 'text-ink-3 hover:text-ink',
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[1.5px] bg-gold transition-all duration-200',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Search */}
          <Link
            href="/search"
            prefetch
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-all duration-200 ease-spring hover:bg-gold/10 hover:text-gold-dk hover:scale-105 active:scale-95"
          >
            <SearchIcon />
          </Link>

          {/* Notification Bell */}
          {user && <NotificationBell unread={unread} />}

          {/* Profile Avatar / Account Menu */}
          <div ref={menuRef} className="relative hidden sm:block">
            {user ? (
              /* ── Logged-in: avatar button ── */
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className={cn(
                  'group relative flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all duration-200 ease-spring active:scale-90',
                  menuOpen
                    ? 'ring-gold shadow-[0_0_0_4px_rgba(184,148,63,0.18)] bg-gold text-white'
                    : 'ring-gold/30 bg-gradient-to-br from-deep to-[#3D2A1E] text-white hover:ring-gold hover:shadow-[0_0_0_4px_rgba(184,148,63,0.14)]',
                )}
              >
                <span className="font-util text-[0.68rem] font-bold leading-none tracking-wide select-none">
                  {initials}
                </span>
                {/* Live online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-emerald-500" />
              </button>
            ) : (
              /* ── Guest: sign-in link ── */
              <Link
                href="/login"
                aria-label="Sign in"
                className="flex h-9 items-center gap-1.5 rounded-full border border-line/60 bg-surface px-3 font-util text-[0.68rem] uppercase tracking-wider text-ink-2 transition-all duration-200 ease-spring hover:border-gold/60 hover:bg-gold/5 hover:text-gold-dk hover:scale-105 active:scale-95"
              >
                <UserIcon />
                <span>Sign in</span>
              </Link>
            )}

            {/* ── Avatar dropdown panel ── */}
            {menuOpen && user && (
              <div className="animate-dropdown-in absolute right-0 top-[calc(100%+10px)] z-[130] w-64 origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                {/* User identity strip */}
                <div className="flex items-center gap-3 border-b border-line px-4 py-3.5 bg-gradient-to-r from-deep/[0.04] to-transparent">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-deep to-[#3D2A1E] font-util text-sm font-bold text-white shadow-xs">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display-alt text-[1rem] font-semibold text-ink leading-tight">
                      {user.name}
                    </p>
                    <p className="truncate font-util text-[0.58rem] uppercase tracking-wider text-ink-3">
                      Fragrance Member
                    </p>
                  </div>
                </div>

                {/* Quick links */}
                <ul className="p-1.5">
                  {ACCOUNT_MENU.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                          pathname.startsWith(item.href)
                            ? 'bg-gold/10 text-gold-dk font-semibold'
                            : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
                          pathname.startsWith(item.href) ? 'bg-gold/20 text-gold-dk' : 'bg-surface-2 text-ink-3',
                        )}>
                          {item.icon}
                        </span>
                        {item.label}
                        {pathname.startsWith(item.href) && (
                          <svg className="ml-auto h-3 w-3 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Divider + logout */}
                <div className="border-t border-line-soft p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-all duration-200 ease-spring hover:bg-gold/10 hover:text-gold-dk active:scale-90"
          >
            <CartIcon />
            {count > 0 && (
              <span
                key={count}
                className="absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 font-util text-[0.52rem] font-semibold leading-none text-white shadow-xs animate-badge-pop"
              >
                {count}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="relative flex flex-col gap-[5px] p-1.5 min-[861px]:hidden"
          >
            <span className="h-0.5 w-6 rounded bg-ink transition-transform duration-200" />
            <span className="h-0.5 w-4 self-end rounded bg-ink transition-all duration-200" />
            <span className="h-0.5 w-6 rounded bg-ink transition-transform duration-200" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} user={user} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

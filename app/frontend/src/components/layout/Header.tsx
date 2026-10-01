'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { MobileNav } from '@/components/layout/MobileNav';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Collection', href: '/products' },
  { label: 'Care', href: '/#care' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Gifting', href: '/categories/gift-sets' },
  { label: 'Refills', href: '/products' },
];

/** Sticky header with centered nav and smooth scroll elevation. */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCartStore((s) => s.count);
  const openCart = useCartStore((s) => s.open);
  const user = useAuthStore((s) => s.user);
  const unread = useNotificationStore((s) => s.unread);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[60] flex items-center justify-between gap-6 px-[var(--pad)] py-[10px] transition-all duration-500 ease-spring backdrop-blur-[16px]',
          scrolled
            ? 'border-b border-gold/25 bg-paper/90 shadow-[0_8px_30px_-10px_rgba(44,24,16,.08)]'
            : 'border-b border-line bg-paper/95',
        )}
      >
        <Link href="/" className="flex flex-shrink-0 items-center leading-none">
          <Image
            src="/assets/Logos/logo.jpeg"
            alt="Dev Creation"
            width={160}
            height={80}
            priority
            className="h-20 w-auto object-contain max-[860px]:h-14"
          />
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 min-[861px]:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative whitespace-nowrap font-body text-[0.82rem] font-medium uppercase tracking-[0.1em] text-ink-3 transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-gold transition-all duration-[250ms] group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-4">
          <Link href="/search" aria-label="Search" className="p-1.5 text-ink-2 transition-colors hover:text-ink">
            <SearchIcon />
          </Link>

          {user && <NotificationBell unread={unread} />}

          <Link
            href={user ? '/account/profile' : '/login'}
            aria-label="Account"
            className="p-1.5 text-ink-2 transition-colors hover:text-ink"
          >
            <UserIcon />
          </Link>

          <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative p-1.5 text-ink-2 transition-all duration-200 hover:text-ink active:scale-90"
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

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="relative flex h-5 w-7 flex-col justify-between p-0 min-[861px]:hidden"
          >
            <span className="h-0.5 w-full rounded bg-ink" />
            <span className="h-0.5 w-full rounded bg-ink" />
            <span className="h-0.5 w-full rounded bg-ink" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} user={user} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

/** Sticky header with centered nav and smooth scroll elevation. */
export function Header() {
  const pathname = usePathname();
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const hashId = href.substring(2);
      const target = document.getElementById(hashId);
      if (pathname === '/') {
        e.preventDefault();
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', href);
          }
        }
      }
    }
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
        <Link href="/" prefetch={true} className="flex flex-shrink-0 items-center leading-none">
          <Image
            src="/assets/Logos/Logo2.png"
            alt="Dev Creation"
            width={72}
            height={72}
            priority
            unoptimized
            className="h-16 w-16 object-contain rounded-full max-[860px]:h-13 max-[860px]:w-13 transition-transform duration-200 hover:scale-105"
          />
        </Link>

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
                prefetch={true}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'group relative whitespace-nowrap font-body text-[0.82rem] font-medium uppercase tracking-[0.1em] transition-colors',
                  isActive ? 'text-ink font-semibold' : 'text-ink-3 hover:text-ink',
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[1.5px] bg-gold transition-all duration-[200ms]',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full',
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-4">
          <Link
            href="/search"
            prefetch={true}
            aria-label="Search"
            className="p-1.5 text-ink-2 transition-all duration-200 hover:text-ink hover:scale-110 active:scale-95"
          >
            <SearchIcon />
          </Link>

          {user && <NotificationBell unread={unread} />}

          <Link
            href={user ? '/account/profile' : '/login'}
            aria-label="Account"
            className="hidden sm:flex p-1.5 text-ink-2 transition-all duration-200 hover:text-ink hover:scale-110 active:scale-95"
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

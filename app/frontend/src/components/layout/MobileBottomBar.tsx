'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function MobileBottomBar() {
  const pathname = usePathname();
  const openCart = useCartStore((s) => s.open);
  const cartIsOpen = useCartStore((s) => s.isOpen);
  const count = useCartStore((s) => s.count);
  const user = useAuthStore((s) => s.user);

  // Hide on admin panel pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isShop = pathname === '/products' || (pathname.startsWith('/products/') && !pathname.includes('tag='));
  const isCategories = pathname.startsWith('/categories');
  const isWishlist = pathname === '/account/wishlist';
  const isAccount = pathname.startsWith('/account') && !isWishlist;

  return (
    <aside
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-line/80 bg-paper/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(44,24,16,0.08)] transition-all will-change-transform pb-[env(safe-area-inset-bottom,0px)]"
    >
      <nav className="flex h-15 items-center justify-around px-2">
        {/* 1. Home Tab */}
        <Link
          href="/"
          prefetch={true}
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90',
            isHome ? 'text-gold-dk' : 'text-ink-3 hover:text-ink'
          )}
        >
          <div className="relative">
            <svg
              className={cn('h-5 w-5 transition-transform', isHome && 'scale-110')}
              viewBox="0 0 24 24"
              fill={isHome ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isHome ? '1.5' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </div>
          <span className="mt-1 font-util text-[0.62rem] font-semibold uppercase tracking-wider">
            Home
          </span>
        </Link>

        {/* 2. Shop Tab */}
        <Link
          href="/products"
          prefetch={true}
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90',
            isShop ? 'text-gold-dk' : 'text-ink-3 hover:text-ink'
          )}
        >
          <div className="relative">
            <svg
              className={cn('h-5 w-5 transition-transform', isShop && 'scale-110')}
              viewBox="0 0 24 24"
              fill={isShop ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={isShop ? '1.5' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="7" height="7" x="3" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="3" rx="1.5" />
              <rect width="7" height="7" x="14" y="14" rx="1.5" />
              <rect width="7" height="7" x="3" y="14" rx="1.5" />
            </svg>
            {isShop && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </div>
          <span className="mt-1 font-util text-[0.62rem] font-semibold uppercase tracking-wider">
            Shop
          </span>
        </Link>

        {/* 3. Categories Tab */}
        <Link
          href="/categories"
          prefetch={true}
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90',
            isCategories ? 'text-gold-dk' : 'text-ink-3 hover:text-ink'
          )}
        >
          <div className="relative">
            <svg
              className={cn('h-5 w-5 transition-transform', isCategories && 'scale-110')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={isCategories ? '2.2' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            {isCategories && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </div>
          <span className="mt-1 font-util text-[0.62rem] font-semibold uppercase tracking-wider">
            Curations
          </span>
        </Link>

        {/* 4. Cart Bag Trigger Tab (App-Style) */}
        <button
          type="button"
          onClick={openCart}
          aria-label="Open Shopping Bag"
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90',
            cartIsOpen ? 'text-gold-dk' : 'text-ink-3 hover:text-ink'
          )}
        >
          <div className="relative">
            <svg
              className={cn('h-5 w-5 transition-transform', cartIsOpen && 'scale-110')}
              viewBox="0 0 24 24"
              fill={cartIsOpen ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={cartIsOpen ? '1.5' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 font-mono text-[0.58rem] font-bold text-white shadow-xs animate-in zoom-in-75">
                {count}
              </span>
            )}
            {cartIsOpen && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </div>
          <span className="mt-1 font-util text-[0.62rem] font-semibold uppercase tracking-wider">
            Bag
          </span>
        </button>

        {/* 5. Account / Guest Tab */}
        <Link
          href={user ? '/account' : '/login'}
          prefetch={true}
          className={cn(
            'group relative flex flex-1 flex-col items-center justify-center py-1.5 transition-all duration-200 active:scale-90',
            isAccount ? 'text-gold-dk' : 'text-ink-3 hover:text-ink'
          )}
        >
          <div className="relative">
            {user ? (
              /* ── Logged-in: mini avatar circle ── */
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full font-util text-[0.58rem] font-bold leading-none transition-all duration-200',
                isAccount
                  ? 'bg-gold text-white ring-2 ring-gold/40 shadow-sm'
                  : 'bg-gradient-to-br from-deep to-[#3D2A1E] text-white ring-2 ring-deep/20',
              )}>
                {user.name
                  ? user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
                  : 'DC'}
              </div>
            ) : (
              /* ── Guest: user icon ── */
              <svg
                className={cn('h-5 w-5 transition-transform', isAccount && 'scale-110')}
                viewBox="0 0 24 24"
                fill={isAccount ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={isAccount ? '1.5' : '1.8'}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            {isAccount && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
            )}
          </div>
          <span className="mt-1 font-util text-[0.62rem] font-semibold uppercase tracking-wider">
            {user ? 'Account' : 'Sign In'}
          </span>
        </Link>
      </nav>
    </aside>
  );
}

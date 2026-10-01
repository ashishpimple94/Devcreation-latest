'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/notifications', label: 'Notifications' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const resetCart = useCartStore((s) => s.reset);
  const resetNotifications = useNotificationStore((s) => s.reset);

  const onLogout = async () => {
    await logout();
    resetCart();
    resetNotifications();
    router.push('/');
  };

  return (
    <RequireAuth>
      <section className="grid grid-cols-1 gap-8 px-[var(--pad)] py-[clamp(40px,6vh,80px)] lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[10px] border border-line bg-surface p-4">
          <nav className="flex flex-col">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-[8px] px-4 py-3 font-util text-[0.7rem] uppercase tracking-[0.12em] transition-colors',
                    active ? 'bg-deep text-white' : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={onLogout}
              className="mt-1 rounded-[8px] px-4 py-3 text-left font-util text-[0.7rem] uppercase tracking-[0.12em] text-red-500 transition-colors hover:bg-red-50"
            >
              Log out
            </button>
          </nav>
        </aside>
        <div>{children}</div>
      </section>
    </RequireAuth>
  );
}

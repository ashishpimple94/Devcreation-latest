'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const POLICY_TABS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Cancellation & Refund', href: '/refund-policy' },
  { label: 'Shipping & Delivery', href: '/shipping-policy' },
  { label: 'Contact Us', href: '/contact' },
];

export function PolicyNav({ current }: { current?: string }) {
  const pathname = usePathname();
  const activeHref = current || pathname;

  return (
    <nav
      aria-label="Legal and Compliance Policies"
      className="mb-10 flex flex-wrap items-center justify-center gap-2 border-b border-line pb-6 pt-2"
    >
      {POLICY_TABS.map((tab) => {
        const isActive = activeHref === tab.href || activeHref.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full px-4 py-2 font-util text-[0.68rem] font-medium tracking-[0.12em] uppercase transition-all duration-200',
              isActive
                ? 'bg-deep text-gold-lt shadow-xs'
                : 'bg-surface-2 text-ink-3 hover:bg-gold/10 hover:text-ink'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

/** Slide-in mobile navigation drawer, ported from the original design. */
export function MobileNav({
  open,
  onClose,
  links,
  user,
}: {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
  user: User | null;
}) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[99] bg-[rgba(28,20,16,.3)] backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'fixed right-0 top-0 z-[100] flex h-[100dvh] w-[min(320px,85vw)] flex-col bg-paper shadow-[-16px_0_40px_rgba(28,20,16,.15)] transition-transform duration-[350ms]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <Image src="/assets/Logos/logo.jpeg" alt="Dev Creation" width={100} height={50} className="h-[50px] w-auto" />
          <button onClick={onClose} aria-label="Close menu" className="p-1 text-[1.8rem] leading-none text-ink-2 hover:text-ink">
            &times;
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-6 py-5">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="border-b border-line-soft py-4 font-body text-base font-medium tracking-[0.04em] text-ink-2 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/account/profile" onClick={onClose} className="border-b border-line-soft py-4 font-body text-base font-medium text-ink-2 hover:text-ink">
                My Account
              </Link>
              <Link href="/account/orders" onClick={onClose} className="border-b border-line-soft py-4 font-body text-base font-medium text-ink-2 hover:text-ink">
                My Orders
              </Link>
            </>
          ) : (
            <Link href="/login" onClick={onClose} className="border-b border-line-soft py-4 font-body text-base font-medium text-ink-2 hover:text-ink">
              Login / Register
            </Link>
          )}
        </nav>

        <div className="flex flex-col gap-[14px] border-t border-line px-6 py-5">
          <p className="util-label">Handcrafted with love, Scented with care</p>
          <a href="https://wa.me/917887582008" className="font-util text-[0.64rem] uppercase tracking-[0.14em] text-[#25D366]">
            WhatsApp us
          </a>
        </div>
      </div>
    </>
  );
}

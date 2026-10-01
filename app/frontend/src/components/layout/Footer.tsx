'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="border-t border-line bg-surface-2 text-ink">
      {/* Main Footer Grid */}
      <div className="mx-auto max-w-shell px-[var(--pad)] py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-12 lg:gap-14">
          {/* Column 1: Brand & Story (4 cols) */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/Logos/logo.jpeg"
                alt="Dev Creation"
                width={160}
                height={80}
                className="h-16 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 font-display-alt text-lg italic text-gold-dk">
              Handcrafted with love, Scented with care.
            </p>

            <p className="mt-3 max-w-[34ch] text-xs font-light leading-relaxed text-body">
              Dev Creation crafts artisanal luxury wax sachets and home fragrances, hand-poured in India with 100%
              pure unbleached soy wax and master perfumer oils.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="font-util text-[0.62rem] uppercase tracking-wider text-copper">Concierge:</span>
              <a
                href="mailto:hello@devcreation.example"
                className="font-util text-xs text-ink transition-colors hover:text-gold"
              >
                hello@devcreation.example
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { name: 'Instagram', icon: <InstagramIcon />, href: 'https://instagram.com' },
                { name: 'WhatsApp', icon: <WhatsAppIcon />, href: 'https://wa.me' },
                { name: 'Pinterest', icon: <PinterestIcon />, href: 'https://pinterest.com' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-3 transition-all hover:border-gold hover:bg-gold hover:text-white hover:shadow-xs"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              Collections
            </h4>
            <ul className="mt-5 space-y-3 text-xs">
              {[
                { label: 'All Wax Sachets', href: '/products' },
                { label: 'Candle Gift Sets', href: '/categories/gift-sets' },
                { label: 'Wardrobe Fresh', href: '/products?tag=wardrobe' },
                { label: 'Best Sellers', href: '/products?sort=popular' },
                { label: 'Seasonal Drops', href: '/products?sort=newest' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-ink-2 transition-colors hover:text-gold hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: The Experience (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              The Experience
            </h4>
            <ul className="mt-5 space-y-3 text-xs">
              {[
                { label: 'How to Use Sachet', href: '/#care' },
                { label: 'Our Story & Craft', href: '/our-story' },
                { label: 'Why Soy Wax?', href: '/#story' },
                { label: 'Fragrance Notes', href: '/#collection' },
                { label: 'Gifting Concierge', href: '/categories/gift-sets' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-ink-2 transition-colors hover:text-gold hover:translate-x-0.5 inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Circle (4 cols) */}
          <div className="md:col-span-4">
            <div className="rounded-3xl border border-gold/30 bg-white/90 p-6 shadow-xs backdrop-blur-sm">
              <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-dk">
                Dev Creation Circle
              </span>
              <h4 className="mt-1 font-display-alt text-xl font-medium text-ink">
                Receive 10% off your first luxury order
              </h4>
              <p className="mt-2 text-xs font-light leading-relaxed text-body">
                Join our fragrance circle for secret seasonal drops, private sale invitations, and candle care rituals.
              </p>

              {subscribed ? (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs text-emerald-800 animate-in fade-in zoom-in-95">
                  ✨ Welcome to the Circle! Check your inbox for your 10% welcome code.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address…"
                    className="flex-1 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none placeholder:text-ink-3/70 focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-4 text-xs font-semibold whitespace-nowrap"
                  >
                    Join
                  </button>
                </form>
              )}

              <p className="mt-3 text-[0.65rem] text-ink-3">
                No spam ever. Unsubscribe anytime with a single click.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-line bg-surface px-[var(--pad)] py-6 text-xs text-ink-3">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Dev Creation. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="font-util text-[0.68rem] text-copper">
              Pure Soy Wax · IFRA Certified · Crafted in India
            </span>
          </div>

          {/* Payment Badges & Trust */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">
              Insured Express Pan-India Delivery
            </span>
            <div className="flex items-center gap-2 text-ink-2">
              <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-util text-[0.6rem] font-bold">
                UPI
              </span>
              <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-util text-[0.6rem] font-bold">
                VISA
              </span>
              <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-util text-[0.6rem] font-bold">
                Mastercard
              </span>
              <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-util text-[0.6rem] font-bold">
                RuPay
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

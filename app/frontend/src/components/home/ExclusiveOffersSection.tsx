'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PERKS = [
  {
    title: 'Exclusive Offers',
    highlight: 'Seasonal Curations',
    description: 'Special seasonal pricing, curated gift hampers, and VIP subscriber secret drops.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    title: 'Free Samples',
    highlight: 'With Every Order',
    description: 'Receive a complimentary sample tester of our newest fragrance creation in every package.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    title: 'Free Shipping',
    highlight: 'Pan-India Over ₹999',
    description: 'Safe, temperature-insulated express courier delivery right to your doorstep.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Personalized Gifting',
    highlight: 'Custom Wax Seal',
    description: 'Handwritten message card with our signature gold wax seal and satin ribbon.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
];

export function ExclusiveOffersSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-deep px-[var(--pad)] py-14 text-white">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] top-0 h-64 w-64 rounded-full bg-gold/10 blur-[80px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] bottom-0 h-64 w-64 rounded-full bg-copper/10 blur-[80px]"
      />

      <div className="relative z-10 mx-auto max-w-shell">
        {/* 4 Interactive Perk Columns */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={perk.title}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  'group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300',
                  isHovered
                    ? 'border-gold/60 bg-white/[0.07] shadow-xl -translate-y-1'
                    : 'border-white/10 bg-white/[0.03] hover:border-gold/30',
                )}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-lt transition-transform duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-deep">
                      {perk.icon}
                    </span>
                    <span className="font-util text-[0.55rem] uppercase tracking-wider text-gold-lt/70">
                      {perk.highlight}
                    </span>
                  </div>

                  <h4 className="font-display-alt text-lg font-medium tracking-wide text-white transition-colors group-hover:text-gold-lt">
                    {perk.title}
                  </h4>

                  <p className="mt-2 text-xs font-light leading-relaxed text-stone-300">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Hallmark Callout */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold-lt font-display text-sm font-semibold">
              DC
            </span>
            <div>
              <div className="font-display text-base font-medium tracking-wide text-white">
                Dev Creation
              </div>
              <p className="font-util text-[0.62rem] uppercase tracking-[0.2em] text-gold-lt/80">
                Handcrafted with love, Scented with care.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/categories/gift-sets"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 font-util text-xs uppercase tracking-wider text-gold-lt transition-all hover:bg-gold hover:text-deep hover:shadow-lg"
            >
              <span>Explore Gifting Sets</span>
              <span>→</span>
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-util text-xs uppercase tracking-wider text-white transition-all hover:border-white hover:bg-white/10"
            >
              <span>Shop All Products</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

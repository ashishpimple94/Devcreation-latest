'use client';

import { useState } from 'react';
import { ScrollAnimate } from '@/components/ScrollAnimate';
import { cn } from '@/lib/utils';

const PILLARS = [
  {
    category: 'Ingredients',
    title: '100% Pure Soy Wax',
    description:
      'No paraffin, no blends, no shortcuts. Pure unbleached soy wax that holds fragrance beautifully and is completely safe for your fabrics, clothes, linens, and living spaces.',
    badge: 'Zero Paraffin',
    comparison: {
      ours: 'Natural unbleached botanical soy wax',
      others: 'Petroleum paraffin blends & toxic additives',
    },
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11C3 6.03 7.03 2 12 2z" />
        <path d="M12 2c0 5-4 9-9 9" />
      </svg>
    ),
  },
  {
    category: 'Fragrance',
    title: 'Premium, IFRA-Certified Oils',
    description:
      'Every scent is formulated with internationally compliant fine fragrance oils — meticulously layered to feel rich, natural, and never overpowering. Designed to linger, not shout.',
    badge: 'IFRA Certified',
    comparison: {
      ours: 'Complex master perfumer fragrance oils',
      others: 'Synthetic chemical aerosols & cheap alcohol scents',
    },
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2h4" />
        <path d="M12 2v3" />
        <path d="M8 8h8l2 12H6L8 8z" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
  },
  {
    category: 'Design',
    title: 'Elegant Enough to Gift',
    description:
      'Every sachet is beautifully designed and thoughtfully packaged with botanical embellishments and ribbons — making it the perfect gift for housewarmings, festivals, weddings, or simple gratitude.',
    badge: 'Ready to Gift',
    comparison: {
      ours: 'Artisan packaging with keepsake wax sachets',
      others: 'Disposable plastic blister packs & cardboards',
    },
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    category: 'Quality',
    title: 'Small Batches, Zero Compromise',
    description:
      'Each batch is handmade with meticulous attention to temperature and cure time. We never mass-produce. If a variant sells out, it returns within ten days — freshly crafted, never rushed.',
    badge: 'Artisanal Batch',
    comparison: {
      ours: 'Small-batch artisanal craft & fresh pour',
      others: 'Stale mass-manufactured warehouse inventory',
    },
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function WhyDevCreationSection() {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="story" className="relative border-t border-line bg-paper px-[var(--pad)] py-[clamp(64px,9vh,112px)]">
      {/* Header */}
      <ScrollAnimate className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/80 px-3.5 py-1 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-util text-[0.62rem] uppercase tracking-[0.2em] text-gold-dk">
              Pure Craft & Philosophy
            </span>
          </div>
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,3.8vw,3.2rem)] font-medium leading-tight text-ink">
            Why Dev Creation?
          </h2>
        </div>

        <div className="flex flex-col items-start gap-4 min-[860px]:items-end">
          <p className="max-w-[42ch] text-[1.05rem] font-light leading-relaxed text-body">
            We started because every air freshener we tried smelled artificial. We wanted something that felt
            genuinely luxurious, naturally fragrant, and safe for modern homes.
          </p>
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-1.5 font-util text-xs tracking-wider text-gold-dk transition-all hover:bg-gold/15"
          >
            <span>{showComparison ? '✕ Hide Comparison' : '⚖ Compare: Our Craft vs Mass Market'}</span>
          </button>
        </div>
      </ScrollAnimate>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar, i) => (
          <ScrollAnimate key={pillar.category} delay={(i + 1) * 100}>
            <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-line bg-surface p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg">
              {/* Top Accent Strip */}
              <span className="absolute inset-x-0 top-0 h-[3.5px] rounded-t-3xl bg-gradient-to-r from-gold via-copper to-gold-lt opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-2 text-ink transition-transform duration-300 group-hover:scale-105 group-hover:text-gold-dk">
                    {pillar.icon}
                  </span>
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 font-util text-[0.6rem] font-semibold uppercase tracking-wider text-gold-dk">
                    {pillar.badge}
                  </span>
                </div>

                <span className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                  {pillar.category}
                </span>

                <h3 className="mb-3 mt-1 font-display-alt text-xl font-medium leading-snug text-ink transition-colors group-hover:text-gold-dk">
                  {pillar.title}
                </h3>

                <p className="text-[0.92rem] font-light leading-relaxed text-body">
                  {pillar.description}
                </p>

                {/* Comparison Box (Toggled) */}
                {showComparison && (
                  <div className="mt-4 space-y-2 rounded-2xl border border-line-soft bg-surface-2/70 p-3 text-xs animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-1.5 text-emerald-800 font-medium">
                      <span>✓</span>
                      <span>{pillar.comparison.ours}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-red-700/80 font-normal">
                      <span>✕</span>
                      <span>{pillar.comparison.others}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Decorative Hallmark */}
              <div className="mt-6 flex items-center justify-between border-t border-line-soft pt-4">
                <span className="font-util text-[0.6rem] uppercase tracking-wider text-ink-3">
                  Dev Creation Standard
                </span>
                <span className="text-gold">✦</span>
              </div>
            </div>
          </ScrollAnimate>
        ))}
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { ScrollAnimate } from '@/components/ScrollAnimate';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    num: '01',
    category: 'Placement',
    title: 'Small, enclosed spaces work best',
    description:
      'Wardrobes, shoe cabinets, drawers, car dashboards, washrooms. The fragrance concentrates in confined spaces and creates a lasting impression every time you open the door.',
    proTip: 'Hang between garment hangers or nestle in linen drawers for maximum aroma diffusion.',
    accentColor: 'from-amber-600 to-gold',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    locations: ['Wardrobes', 'Shoe Cabinets', 'Drawers', 'Car Interiors', 'Washrooms'],
  },
  {
    num: '02',
    category: 'Duration',
    title: 'Enjoy 4–6 weeks of continuous fragrance',
    description:
      'Each sachet is engineered with pure unbleached botanical wax to release fine fragrance steadily over weeks. Cooler environments extend longevity even further.',
    proTip: 'Simply replace with a fresh sachet once the aroma gently fades to keep spaces consistently scented.',
    accentColor: 'from-gold to-copper',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    timeline: [
      { week: 'Wk 1–2', desc: 'Vibrant & fresh top notes' },
      { week: 'Wk 3–4', desc: 'Warm floral & amber heart' },
      { week: 'Wk 5–6', desc: 'Subtle lingering base oils' },
    ],
  },
  {
    num: '03',
    category: 'Care',
    title: 'Keep away from direct heat & sunlight',
    description:
      'Soy wax naturally softens above 45°C. Avoid placing sachets near hot windows, heating vents, or in direct scorching summer sun to preserve their structural shape and delicate oils.',
    proTip: 'Keep in shaded, ambient areas. The wax stays firm and pristine while diffusing pure scent.',
    accentColor: 'from-copper to-amber-700',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
    spec: 'Optimal: Under 38°C · Shaded Living Spaces',
  },
  {
    num: '04',
    category: 'Refresh',
    title: 'Warm gently to revive the aroma',
    description:
      'When the fragrance softens over time, simply rub the sachet gently between your warm palms for 10–15 seconds. Body warmth re-liquefies essential oils on the surface, instantly boosting scent release.',
    proTip: 'Tap below to see the natural reactivation in action!',
    accentColor: 'from-amber-700 to-deep',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    isInteractiveWarmth: true,
  },
];

export function HowToUseSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [warmed, setWarmed] = useState(false);

  const handleWarmClick = () => {
    setWarmed(true);
    setTimeout(() => setWarmed(false), 2500);
  };

  return (
    <section id="care" className="relative border-t border-line bg-gradient-to-b from-paper to-[#FBF7F0] px-[var(--pad)] py-[clamp(64px,9vh,112px)]">
      {/* Section Header */}
      <ScrollAnimate className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/80 px-3.5 py-1 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-util text-[0.62rem] uppercase tracking-[0.2em] text-gold-dk">
              Ritual & Care Guide
            </span>
          </div>
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,3.8vw,3.2rem)] font-medium leading-tight text-ink">
            How to use your sachet
          </h2>
        </div>
        <p className="max-w-[42ch] text-[1.05rem] font-light leading-relaxed text-body">
          A few simple steps to get the most out of every Dev Creation wax sachet — richer fragrance throw,
          longer life, and enduring elegance in your home.
        </p>
      </ScrollAnimate>

      {/* Step Selector Tabs (Mobile & Quick Nav) */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STEPS.map((step, idx) => (
          <button
            key={step.num}
            onClick={() => setActiveStep(idx)}
            className={cn(
              'flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-util text-xs tracking-wider transition-all',
              activeStep === idx
                ? 'border-deep bg-deep text-white shadow-md'
                : 'border-line bg-white/70 text-ink-3 hover:border-gold hover:text-ink',
            )}
          >
            <span className={activeStep === idx ? 'text-gold-lt' : 'text-copper font-semibold'}>
              {step.num}
            </span>
            <span>{step.category}</span>
          </button>
        ))}
      </div>

      {/* 4 Interactive Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const isSelected = activeStep === i;

          return (
            <ScrollAnimate key={step.num} delay={(i + 1) * 100}>
              <div
                onClick={() => setActiveStep(i)}
                className={cn(
                  'group relative flex h-full cursor-pointer flex-col justify-between rounded-3xl border bg-white p-7 transition-all duration-300',
                  isSelected
                    ? 'border-gold shadow-xl ring-2 ring-gold/20 -translate-y-1'
                    : 'border-line shadow-xs hover:-translate-y-1 hover:border-gold/60 hover:shadow-md',
                )}
              >
                {/* Top Bar Glow on Selection */}
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-[3.5px] rounded-t-3xl transition-opacity duration-300',
                    isSelected
                      ? 'bg-gradient-to-r from-gold via-copper to-deep opacity-100'
                      : 'bg-gradient-to-r from-gold/40 to-transparent opacity-0 group-hover:opacity-100',
                  )}
                />

                <div>
                  {/* Step Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-2 text-ink transition-transform duration-300 group-hover:scale-105 group-hover:text-gold-dk">
                      {step.icon}
                    </span>
                    <span className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                      {step.num} · {step.category}
                    </span>
                  </div>

                  <h3 className="mb-3 font-display-alt text-xl font-medium leading-snug text-ink transition-colors group-hover:text-gold-dk">
                    {step.title}
                  </h3>

                  <p className="text-[0.92rem] font-light leading-relaxed text-body">
                    {step.description}
                  </p>

                  {/* Step-specific Interactive Additions */}
                  {step.locations && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {step.locations.map((loc) => (
                        <span
                          key={loc}
                          className="rounded-lg bg-surface-2 px-2 py-0.5 font-util text-[0.6rem] text-ink-3 transition-colors hover:bg-gold/10 hover:text-gold-dk"
                        >
                          {loc}
                        </span>
                      ))}
                    </div>
                  )}

                  {step.timeline && (
                    <div className="mt-4 space-y-1.5 rounded-xl border border-line-soft bg-surface-2/60 p-2.5">
                      {step.timeline.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[0.72rem]">
                          <span className="font-util font-semibold text-copper">{t.week}</span>
                          <span className="text-ink-3">{t.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.spec && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-1 font-util text-[0.68rem] text-ink-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{step.spec}</span>
                    </div>
                  )}

                  {step.isInteractiveWarmth && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWarmClick();
                        }}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 font-util text-xs uppercase tracking-wider transition-all duration-300',
                          warmed
                            ? 'border-gold bg-gradient-to-r from-gold to-copper text-white shadow-lg animate-pulse'
                            : 'border-gold/40 bg-gold/10 text-gold-dk hover:bg-gold/20',
                        )}
                      >
                        <span>{warmed ? '✨ Reactivating Oils...' : '✋ Tap to Warm & Revive'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Pro Tip Box */}
                <div className="mt-6 border-t border-line-soft pt-4">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">
                      Pro Tip:
                    </span>
                    <span className="text-ink-3 leading-relaxed">{step.proTip}</span>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          );
        })}
      </div>
    </section>
  );
}

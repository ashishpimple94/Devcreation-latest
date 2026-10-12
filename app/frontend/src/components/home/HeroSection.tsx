'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ScrollAnimate } from '@/components/ScrollAnimate';

interface CarouselSlide {
  id: number;
  image: string;
  eyebrow: string;
  titlePart1: string;
  titleHighlight: string;
  titlePart2: string;
  description: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
  badge: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: '/assets/image1.jpg',
    eyebrow: 'Artisanal Home Fragrances · Hand-Poured in India',
    titlePart1: 'Fragrance that ',
    titleHighlight: 'lingers',
    titlePart2: ' in every space.',
    description:
      'Handcrafted with 100% pure botanical soy wax and master perfumer oils. Thoughtfully poured to gently scent wardrobes, drawers, cars, and personal sanctuaries.',
    primaryCtaText: 'Shop the Collection',
    primaryCtaHref: '/products',
    secondaryCtaText: 'Our Craft & Story ✧',
    secondaryCtaHref: '/our-story',
    badge: '',
  },
  {
    id: 2,
    image: '/assets/image2.jpg',
    eyebrow: 'Curated Celebration Boxes · Signature Gifting',
    titlePart1: 'The Art of ',
    titleHighlight: 'thoughtful',
    titlePart2: ' gifting.',
    description:
      'Complete sensory luxury gift sets featuring hand-poured aroma stones and scented soy wax melts, packaged in exquisite magnetic gift boxes for memorable occasions.',
    primaryCtaText: 'Explore Gift Sets',
    primaryCtaHref: '/categories/gift-sets',
    secondaryCtaText: 'View All Products →',
    secondaryCtaHref: '/products',
    badge: '',
  },
  {
    id: 3,
    image: '/assets/image3.jpg',
    eyebrow: 'Serene Sanctuary & Linen Rituals',
    titlePart1: 'Moments of ',
    titleHighlight: 'pure everyday',
    titlePart2: ' calm.',
    description:
      'Infuse your closets, bedrooms, and daily living spaces with soothing lavender, warm Bourbon vanilla, and delicate florals for 4–6 weeks of continuous aroma.',
    primaryCtaText: 'Explore Wax Sachets',
    primaryCtaHref: '/products?tag=wardrobe',
    secondaryCtaText: 'How to Use Sachet ✦',
    secondaryCtaHref: '/#care',
    badge: '',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  // Autoplay carousel timer (advances every 5.5 seconds unless hovered)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden bg-paper">
      {/* ========================================================= */}
      {/* 1. FULL-WIDTH HERO CAROUSEL                               */}
      {/* ========================================================= */}
      <div
        className="relative w-full overflow-hidden bg-deep border-b border-gold/25"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative h-[560px] sm:h-[640px] lg:h-[720px] xl:h-[780px] w-full overflow-hidden">

          {/* Slides Loop */}
          {CAROUSEL_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                aria-hidden={!isActive}
              >
                {/* Background Image with Slow Ambient Scale */}
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.titlePart1 + slide.titleHighlight + slide.titlePart2}
                    className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out will-change-transform ${isActive ? 'scale-108' : 'scale-100'
                      }`}
                  />
                  {/* Multi-layered Editorial Scrim for Crisp Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/60 to-deep/30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-deep/75 via-transparent to-deep/75" />
                </div>

                {/* Floating Top Badge */}
                <div className="absolute top-6 sm:top-8 left-6 sm:left-12 lg:left-16 z-20">
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-deep/85 px-4 py-1.5 font-util text-[0.62rem] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gold-lt shadow-lg backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    {slide.badge}
                  </span>
                </div>

                {/* Slide Number Counter (e.g. 01 / 03) */}
                <div className="absolute top-6 sm:top-8 right-6 sm:right-12 lg:right-16 z-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-deep/80 px-3.5 py-1.5 font-util text-[0.7rem] tracking-widest text-white/90 backdrop-blur-md">
                    <span className="font-bold text-gold">0{index + 1}</span>
                    <span className="text-white/40">/</span>
                    <span>0{CAROUSEL_SLIDES.length}</span>
                  </span>
                </div>

                {/* Centered Editorial Content with Staggered Cascading Reveal */}
                <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 sm:px-12 text-center text-white">
                  <div className="max-w-4xl pt-8 pb-12">
                    {/* Eyebrow */}
                    <p
                      className={`font-util text-[0.68rem] sm:text-xs font-semibold uppercase tracking-[0.24em] text-gold-lt transition-all duration-700 ease-spring ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                        }`}
                    >
                      {slide.eyebrow}
                    </p>

                    {/* Headline with Gold Cursive Accent */}
                    <h1
                      className={`mt-3.5 sm:mt-5 font-display-alt text-[clamp(2.5rem,6.2vw,5.2rem)] font-medium leading-[1.06] tracking-[-0.015em] text-white drop-shadow-sm transition-all duration-700 delay-100 ease-spring ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                    >
                      {slide.titlePart1}
                      <span className="relative inline-block font-normal not-italic text-gold-lt italic">
                        {slide.titleHighlight}
                        <svg
                          className={`absolute -bottom-2 left-0 w-full text-gold-lt/70 transition-transform duration-1000 delay-200 ease-spring origin-left ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                            }`}
                          viewBox="0 0 100 12"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M0,9 Q50,1 100,9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      {slide.titlePart2}
                    </h1>

                    {/* Narrative Subtext */}
                    <p
                      className={`mx-auto mt-4 sm:mt-5 max-w-2xl font-body text-xs sm:text-base font-light leading-relaxed text-white/90 transition-all duration-700 delay-200 ease-spring ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                        }`}
                    >
                      {slide.description}
                    </p>

                    {/* Action Buttons */}
                    <div
                      className={`mt-7 sm:mt-9 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 transition-all duration-700 delay-300 ease-spring ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                        }`}
                    >
                      <Link
                        href={slide.primaryCtaHref}
                        className="btn-primary group gap-2.5 px-8 py-3.5 sm:px-9 sm:py-4 text-xs font-semibold uppercase tracking-[0.14em] shadow-[0_12px_32px_rgba(0,0,0,.45)] transition-all hover:scale-[1.04] active:scale-[0.96]"
                      >
                        <span>{slide.primaryCtaText}</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </Link>
                      <Link
                        href={slide.secondaryCtaHref}
                        className="rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 sm:px-8 sm:py-4 font-body text-xs font-medium uppercase tracking-[0.14em] text-white backdrop-blur-md transition-all hover:border-gold hover:bg-white/20 hover:text-gold-lt hover:scale-[1.04] active:scale-[0.96]"
                      >
                        {slide.secondaryCtaText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Previous Slide Button with Magnetic Spring Hover */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="group absolute left-4 sm:left-8 lg:left-12 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-deep/70 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-115 hover:border-gold hover:bg-gold hover:text-white active:scale-90 shadow-glow"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Next Slide Button with Magnetic Spring Hover */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="group absolute right-4 sm:right-8 lg:right-12 top-1/2 z-30 -translate-y-1/2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-deep/70 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-115 hover:border-gold hover:bg-gold hover:text-white active:scale-90 shadow-glow"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-0.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Carousel Slide Indicators with Live Autoplay Progress Timer */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/20 bg-deep/80 px-4 py-2 backdrop-blur-md">
            {CAROUSEL_SLIDES.map((slide, idx) => (
              idx === currentSlide ? (
                <div
                  key={`active-progress-${slide.id}`}
                  className="relative h-2.5 w-10 overflow-hidden rounded-full bg-white/25 shadow-glow"
                  title="Current slide (auto-playing)"
                >
                  <div
                    key={`fill-${currentSlide}`}
                    className="h-full rounded-full bg-gold animate-slide-progress"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                  />
                </div>
              ) : (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="h-2.5 w-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-125"
                />
              )
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Trust Strip with Subtle Micro-Animations */}
      <ScrollAnimate direction="up" className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-[var(--pad)] font-util text-[0.68rem] tracking-wider text-ink-3">
        <span className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <span className="text-gold animate-pulse">✦</span> 100% Pure Soy Wax
        </span>
        <span className="hidden sm:inline text-line">·</span>
        <span className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <span className="text-gold animate-pulse">✦</span> IFRA-Certified Perfumer Oils
        </span>
        <span className="hidden sm:inline text-line">·</span>
        <span className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <span className="text-gold animate-pulse">✦</span> 4–6 Weeks Fragrance Life
        </span>
        <span className="hidden sm:inline text-line">·</span>
        <span className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
          <span className="text-gold animate-pulse">✦</span> Insured Express Pan-India Delivery
        </span>
      </ScrollAnimate>

      {/* ========================================================= */}
      {/* 2. TWO-PART FEATURE SHOWCASE STRIP                        */}
      {/* ========================================================= */}
      <div className="relative z-[2] mx-auto max-w-shell px-[var(--pad)] pt-12 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">

          {/* Showcase 1: Artisanal Wax Sachets */}
          <ScrollAnimate direction="up" delay={0}>
            <Link
              href="/products?tag=wardrobe"
              className="shine-hover group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-[28px] border border-line bg-surface p-7 sm:p-9 shadow-card transition-all duration-500 ease-spring hover:-translate-y-2 hover:border-gold hover:shadow-card-hover will-change-transform"
            >
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/elegant-display-lit-candles-with-golden-holders-marble-table-featuring-decorative-plant_93675-335471.avif"
                  alt="Artisanal Wax Sachets"
                  className="h-full w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/45 to-transparent" />
              </div>

              <div className="absolute top-6 left-6 z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-deep/75 px-3.5 py-1.5 font-util text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-lt backdrop-blur-md">
                  <span>🌿</span> Wardrobe &amp; Linen Fragrance
                </span>
              </div>

              <div className="relative z-10 text-white">
                <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-lt">
                  Collection Spotlight
                </span>
                <h2 className="mt-1 font-display-alt text-2xl font-medium sm:text-3xl transition-colors duration-300 group-hover:text-gold-lt">
                  Artisanal Wax Sachets
                </h2>
                <p className="mt-2 max-w-md text-xs font-light leading-relaxed text-white/80 sm:text-sm">
                  Infused with French lavender, warm vanilla, and botanical petals. Hung with satin ribbon to keep your clothing and drawers freshly fragranced.
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="font-body text-sm font-semibold text-gold-lt">From ₹599</span>
                  <span className="inline-flex items-center gap-2 font-util text-xs font-medium uppercase tracking-wider text-white transition-transform group-hover:translate-x-2 duration-300">
                    <span>Explore Sachets</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          </ScrollAnimate>

          {/* Showcase 2: Luxury Gift Sets */}
          <ScrollAnimate direction="up" delay={120}>
            <Link
              href="/categories/gift-sets"
              className="shine-hover group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-[28px] border border-line bg-surface p-7 sm:p-9 shadow-card transition-all duration-500 ease-spring hover:-translate-y-2 hover:border-gold hover:shadow-card-hover will-change-transform"
            >
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/Gifting/Pasted image (2).png"
                  alt="Aroma Stone and Candle Gift Sets"
                  className="h-full w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/45 to-transparent" />
              </div>

              <div className="absolute top-6 left-6 z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-deep/75 px-3.5 py-1.5 font-util text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold-lt backdrop-blur-md">
                  <span>🎁</span> Perfect For Gifting
                </span>
              </div>

              <div className="relative z-10 text-white">
                <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-lt">
                  Curated Sets
                </span>
                <h2 className="mt-1 font-display-alt text-2xl font-medium sm:text-3xl transition-colors duration-300 group-hover:text-gold-lt">
                  Candle &amp; Aroma Gift Sets
                </h2>
                <p className="mt-2 max-w-md text-xs font-light leading-relaxed text-white/80 sm:text-sm">
                  Complete sensory gift boxes with luxury scented aroma stones and soy melts. Presented in signature magnetic gift packaging for celebrations.
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="font-body text-sm font-semibold text-gold-lt">From ₹649</span>
                  <span className="inline-flex items-center gap-2 font-util text-xs font-medium uppercase tracking-wider text-white transition-transform group-hover:translate-x-2 duration-300">
                    <span>Explore Gift Sets</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          </ScrollAnimate>

        </div>
      </div>
    </section>
  );
}

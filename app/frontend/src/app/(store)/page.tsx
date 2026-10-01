import Link from 'next/link';
import { ScrollAnimate } from '@/components/ScrollAnimate';
import { ProductCard } from '@/components/product/ProductCard';
import { HowToUseSection } from '@/components/home/HowToUseSection';
import { WhyDevCreationSection } from '@/components/home/WhyDevCreationSection';
import { ExclusiveOffersSection } from '@/components/home/ExclusiveOffersSection';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

// Revalidate periodically; product data is cached on the backend via Redis too.
export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  try {
    const res = await productService.list({ limit: 12 });
    products = res.items;
  } catch {
    products = [];
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] overflow-hidden px-[var(--pad)] py-[clamp(24px,4vh,48px)] flex items-center">
        {/* Ambient atmospheric background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[10%] top-[25%] aspect-square w-[min(70vw,720px)] animate-breathe rounded-full blur-[80px]"
          style={{
            background:
              'radial-gradient(circle, rgba(212,176,106,0.25) 0%, rgba(193,127,62,0.12) 42%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-[10%] bottom-[10%] aspect-square w-[min(50vw,500px)] rounded-full blur-[90px]"
          style={{
            background:
              'radial-gradient(circle, rgba(193,127,62,0.14) 0%, rgba(184,148,63,0.06) 50%, transparent 70%)',
          }}
        />

        <div className="relative z-[2] mx-auto grid w-full max-w-shell grid-cols-1 items-center gap-12 min-[920px]:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Editorial & Value Proposition */}
          <div className="max-w-[42ch] max-[919px]:order-2">
            <ScrollAnimate>
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-white/80 px-4 py-1.5 shadow-xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                <span className="font-util text-[0.62rem] uppercase tracking-[0.2em] text-gold-dk">
                  Handcrafted with Love · Artisanal Wax Sachets
                </span>
              </div>
            </ScrollAnimate>

            <ScrollAnimate delay={100}>
              <h1 className="font-display-alt text-[clamp(2.8rem,6.2vw,5.4rem)] font-medium leading-[1.04] tracking-[-0.015em] text-ink">
                Fragrance that{' '}
                <span className="relative inline-block font-normal not-italic text-gold italic">
                  lingers
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full text-gold/45"
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
                </span>{' '}
                in every space.
              </h1>
            </ScrollAnimate>

            <ScrollAnimate delay={200}>
              <p className="mt-6 text-[1.1rem] font-light leading-relaxed text-body sm:text-[1.16rem]">
                Dev Creation crafts luxury wax sachets infused with fine fragrances — place them in wardrobes,
                drawers, cars, or any space that deserves a touch of elegance. Hand-poured in small batches with
                botanical soy wax and IFRA-certified oils.
              </p>
            </ScrollAnimate>

            {/* CTAs */}
            <ScrollAnimate delay={300}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="btn-primary group gap-2.5 shadow-[0_8px_24px_rgba(44,24,16,.18)] transition-all hover:scale-[1.02]"
                >
                  <span>Shop the collection</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
                <Link href="/our-story" className="btn-ghost gap-2 transition-all hover:scale-[1.02]">
                  <span>How we pour</span>
                  <span className="text-gold">✧</span>
                </Link>
              </div>
            </ScrollAnimate>

            {/* Scent notes pill strip */}
            <ScrollAnimate delay={380}>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="font-util text-[0.6rem] uppercase tracking-[0.16em] text-copper">Signature Notes:</span>
                {['French Lavender', 'Warm Vanilla', 'Rose Damascena', 'Oud & Sandalwood'].map((scent) => (
                  <span
                    key={scent}
                    className="rounded-full border border-line bg-surface-2/80 px-2.5 py-0.5 font-util text-[0.58rem] tracking-wide text-ink-2 backdrop-blur-xs"
                  >
                    {scent}
                  </span>
                ))}
              </div>
            </ScrollAnimate>

            {/* Trust Metrics Bar */}
            <ScrollAnimate delay={450}>
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line-soft pt-6 max-w-[400px]">
                <div>
                  <div className="font-display text-xl font-semibold text-ink">4.9 ★</div>
                  <div className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3">500+ Reviews</div>
                </div>
                <div className="border-l border-line-soft pl-3">
                  <div className="font-display text-xl font-semibold text-ink">4–6 Wks</div>
                  <div className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3">Aroma Life</div>
                </div>
                <div className="border-l border-line-soft pl-3">
                  <div className="font-display text-xl font-semibold text-ink">100%</div>
                  <div className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3">Pure Soy Wax</div>
                </div>
              </div>
            </ScrollAnimate>
          </div>

          {/* Right Column: Visual Showcase & Floating Feature Cards */}
          <ScrollAnimate
            direction="right"
            delay={250}
            className="relative z-[2] flex items-center justify-center max-[919px]:order-1"
          >
            {/* Architectural decorative frame */}
            <div className="group relative w-full max-w-[540px] rounded-[36px] border border-gold/30 bg-gradient-to-br from-white/95 via-[#FDF9F2] to-white/80 p-3.5 shadow-[0_24px_60px_-15px_rgba(44,24,16,.18)] backdrop-blur-sm transition-all duration-700 hover:border-gold/60 hover:shadow-[0_30px_70px_-15px_rgba(184,148,63,.22)]">
              {/* Inner Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] sm:aspect-[5/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/elegant-display-lit-candles-with-golden-holders-marble-table-featuring-decorative-plant_93675-335471.avif"
                  alt="Dev Creation luxury handcrafted scented wax sachets"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.04]"
                />
                {/* Subtle soft vignette */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent" />
              </div>

              {/* Floating Badge 1: Top-Right Soy Wax Guarantee (Gentle Floating) */}
              <div className="absolute -top-4 right-4 z-10 flex items-center gap-2 rounded-2xl border border-gold/30 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 animate-float will-change-transform">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-sm text-gold-dk">
                  🌿
                </span>
                <div>
                  <div className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-ink">100% Pure Soy</div>
                  <div className="text-[0.65rem] text-ink-3">No paraffin · Clean burning</div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom-Left Longevity (Delayed Floating) */}
              <div className="absolute -bottom-5 left-4 z-10 hidden sm:flex items-center gap-3 rounded-2xl border border-gold/30 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 animate-float-delayed will-change-transform">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-copper text-white shadow-xs">
                  ✨
                </span>
                <div>
                  <div className="font-util text-[0.65rem] font-bold uppercase tracking-wider text-ink">4–6 Weeks Fragrance</div>
                  <div className="text-[0.68rem] text-ink-3">Wardrobes · Drawers · Cars</div>
                </div>
              </div>

              {/* Floating Badge 3: Rating Pill */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-line bg-deep/90 px-3 py-1.5 text-white shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105">
                <span className="text-xs text-yellow-400">★★★★★</span>
                <span className="font-util text-[0.6rem] font-medium tracking-wide text-gold-lt">4.9 / 5.0</span>
              </div>
            </div>
          </ScrollAnimate>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="border-t border-line bg-surface-2 px-[var(--pad)] py-[clamp(64px,9vh,112px)]">
        <ScrollAnimate className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-[16ch] font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-tight text-ink">
            Six fragrances, endless elegance
          </h2>
          <p className="max-w-[38ch] text-[0.94rem]">
            Every wax sachet is handcrafted with premium soy wax and fine fragrance oils. Notes are listed the way a
            perfumer reads them — what you meet first, what settles, what stays.
          </p>
        </ScrollAnimate>

        {products.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
            <p className="font-display-alt text-xl text-ink">Our collection is being restocked</p>
            <p className="mt-2 text-sm text-body">
              Run <code className="font-util text-copper">npm run seed</code> in the backend to load the catalogue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {products.map((product, i) => (
              <ScrollAnimate key={product._id} delay={Math.min(i, 4) * 60}>
                <ProductCard product={product} />
              </ScrollAnimate>
            ))}
          </div>
        )}
      </section>

      {/* How to use your sachet (Interactive Guide) */}
      <HowToUseSection />

      {/* Why Dev Creation? (Interactive Brand Pillars) */}
      <WhyDevCreationSection />

      {/* Exclusive Offers & Perks */}
      <ExclusiveOffersSection />
    </>
  );
}

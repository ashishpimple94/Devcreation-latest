import Link from 'next/link';
import { ScrollAnimate } from '@/components/ScrollAnimate';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroSection } from '@/components/home/HeroSection';
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
      {/* Enhanced 2-Section Hero */}
      <HeroSection />

      {/* Collection */}
      <section id="collection" className="border-t border-line bg-surface-2 px-[var(--pad)] py-[clamp(64px,9vh,112px)]">
        <div className="mx-auto max-w-7xl">
          <ScrollAnimate direction="up" className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-util text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#6B6547]">
                Featured Collection
              </span>
              <h2 className="mt-2 max-w-[16ch] font-display text-[clamp(2.1rem,3.8vw,3.2rem)] font-medium leading-tight text-ink">
                Artisanal Scents, Endless Elegance
              </h2>
            </div>
            <p className="max-w-[42ch] font-body text-[0.95rem] text-body">
              Every wax sachet and candle is handcrafted with 100% natural soy wax and fine fragrance oils.
              Poured in small batches for lasting aroma.
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {products.map((product, i) => (
                <ScrollAnimate key={product._id} direction="up" delay={(i % 3) * 110}>
                  <ProductCard product={product} priority={i < 3} />
                </ScrollAnimate>
              ))}
            </div>
          )}
        </div>
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

import { ProductBrowser } from '@/components/product/ProductBrowser';

export const metadata = { title: 'Collection — Dev Creation' };

export default function ProductsPage() {
  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <div className="mb-10">
        <span className="util-label">The collection</span>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">Handcrafted fragrances</h1>
        <p className="mt-2 max-w-[52ch] text-[0.94rem]">
          Explore every Dev Creation wax sachet, melt, aroma stone and gift set — search, filter and sort to find your scent.
        </p>
      </div>
      <ProductBrowser />
    </section>
  );
}

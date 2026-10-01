import { ProductBrowser } from '@/components/product/ProductBrowser';

export const metadata = { title: 'Search — Dev Creation' };

export default function SearchPage() {
  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <div className="mb-10">
        <span className="util-label">Search</span>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">Find your fragrance</h1>
      </div>
      <ProductBrowser />
    </section>
  );
}

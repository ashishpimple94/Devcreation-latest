import { ProductBrowser } from '@/components/product/ProductBrowser';

export const metadata = {
  title: 'Shop All Products — Luxury Soy Wax Sachets & Fragrances',
  description:
    'Explore our artisanal collection of handcrafted soy wax sachets, botanical wax melts, aroma stones, and luxury fragrance gift sets.',
};

export default function ProductsPage() {
  return (
    <section className="px-[var(--pad)] py-[clamp(40px,6vh,72px)]">
      <ProductBrowser showTitle={true} />
    </section>
  );
}

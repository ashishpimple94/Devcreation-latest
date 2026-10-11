import { ProductBrowser } from '@/components/product/ProductBrowser';

export const metadata = {
  title: 'Shop — Dev Creation Handcrafted Candles & Fragrances',
  description:
    'Explore our artisanal range of scented jar candles, pillar candles, tea lights, wax melts and gift sets.',
};

export default function ProductsPage() {
  return (
    <section className="px-[var(--pad)] py-[clamp(40px,6vh,72px)]">
      <ProductBrowser showTitle={true} />
    </section>
  );
}

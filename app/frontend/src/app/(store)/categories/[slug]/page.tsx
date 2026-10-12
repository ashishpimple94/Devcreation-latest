import { ProductBrowser } from '@/components/product/ProductBrowser';
import { productService } from '@/services/product.service';
import type { Category } from '@/types';

export const revalidate = 300;

const KNOWN_CATEGORIES: Record<string, { name: string; description: string }> = {
  'gift-sets': {
    name: 'Gift Sets & Hampers',
    description: 'Curated artisanal wax gift sets, elegant packaging & luxury home fragrance hampers.',
  },
  'wax-melts': {
    name: 'Wax Melts & Refills',
    description: 'Handcrafted soy wax melts and fragrant refills for your wax warmers and burners.',
  },
  'wax-sachets': {
    name: 'Artisanal Wax Sachets',
    description: 'Hand-poured botanical soy wax sachets for wardrobes, closets, cars and living spaces.',
  },
  'aroma-stones': {
    name: 'Aroma Stones',
    description: 'Porous ceramic aroma stones infused with therapeutic botanical fragrance oils.',
  },
};

export async function generateStaticParams() {
  try {
    const categories = await productService.categories();
    if (categories && categories.length > 0) {
      return categories.map((c) => ({ slug: c.slug }));
    }
  } catch {
    // Fallback
  }
  return [
    { slug: 'aroma-stones' },
    { slug: 'gift-sets' },
    { slug: 'wax-melts' },
    { slug: 'wax-sachets' },
  ];
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  let category: Category | undefined;
  try {
    const categories = await productService.categories();
    category = categories?.find((c) => c.slug === params.slug);
  } catch {
    category = undefined;
  }

  const known = KNOWN_CATEGORIES[params.slug];
  const title = category?.name || known?.name || 'Collection';
  const description = category?.description || known?.description;

  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <div className="mb-10">
        <span className="util-label">Category</span>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-[52ch] text-[0.94rem] text-body">{description}</p>}
      </div>
      <ProductBrowser
        initialCategory={category?._id}
        initialCategorySlug={params.slug}
        showTitle={false}
      />
    </section>
  );
}

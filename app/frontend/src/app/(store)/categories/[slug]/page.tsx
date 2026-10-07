import { ProductBrowser } from '@/components/product/ProductBrowser';
import { productService } from '@/services/product.service';
import type { Category } from '@/types';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const categories = await productService.categories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [
      { slug: 'aroma-stones' },
      { slug: 'gift-sets' },
      { slug: 'wax-melts' },
      { slug: 'wax-sachets' },
    ];
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  let category: Category | undefined;
  try {
    const categories = await productService.categories();
    category = categories.find((c) => c.slug === params.slug);
  } catch {
    category = undefined;
  }

  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <div className="mb-10">
        <span className="util-label">Category</span>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">
          {category?.name ?? 'Collection'}
        </h1>
        {category?.description && <p className="mt-2 max-w-[52ch] text-[0.94rem]">{category.description}</p>}
      </div>
      <ProductBrowser initialCategory={category?._id} />
    </section>
  );
}

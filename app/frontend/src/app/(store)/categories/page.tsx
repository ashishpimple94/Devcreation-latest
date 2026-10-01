import Link from 'next/link';
import { productService } from '@/services/product.service';
import type { Category } from '@/types';

export const metadata = { title: 'Categories — Dev Creation' };
export const revalidate = 300;

export default async function CategoriesPage() {
  let categories: Category[] = [];
  try {
    categories = await productService.categories();
  } catch {
    categories = [];
  }

  return (
    <section className="px-[var(--pad)] py-[clamp(48px,7vh,88px)]">
      <div className="mb-10">
        <span className="util-label">Browse</span>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-medium text-ink">Shop by category</h1>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-body">No categories yet. Seed the catalogue to get started.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col justify-between rounded-[10px] border border-line bg-surface p-7 transition-all hover:-translate-y-0.5 hover:shadow-rule"
            >
              <div>
                <h2 className="font-display-alt text-[1.5rem] font-medium text-ink">{c.name}</h2>
                {c.description && <p className="mt-2 text-[0.9rem] leading-relaxed">{c.description}</p>}
              </div>
              <span className="mt-6 font-util text-[0.62rem] uppercase tracking-[0.18em] text-gold group-hover:text-gold-dk">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

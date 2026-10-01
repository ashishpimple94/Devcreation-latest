import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const product = await productService.getBySlug(params.slug);
    return { title: `${product.name} — Dev Creation`, description: product.description };
  } catch {
    return { title: 'Product — Dev Creation' };
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: Product;
  let related: Product[] = [];
  try {
    product = await productService.getBySlug(params.slug);
    related = await productService.related(params.slug).catch(() => []);
  } catch {
    notFound();
  }

  return <ProductDetail product={product} related={related} />;
}

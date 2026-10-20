import type { Metadata } from 'next';
import { ProductDetailWrapper } from '@/components/product/ProductDetailWrapper';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export const revalidate = 60;

const FALLBACK_PRODUCTS: Record<string, Partial<Product>> = {
  'wax-sachet': {
    name: 'Wax Sachet',
    slug: 'wax-sachet',
    sku: 'DC-SACHET',
    price: 499,
    description: 'Use for car, bathrooms, gifting & home decor. A long-lasting botanical wax sachet that keeps your spaces fresh and fragrant.',
    stock: 60,
    ratingAverage: 4.9,
    ratingCount: 142,
    images: [{ url: '/assets/Gifting/1.jpeg', alt: 'Wax Sachet' }],
  },
  'wax-melt-gift-set': {
    name: 'Wax Melt Gift Set',
    slug: 'wax-melt-gift-set',
    sku: 'DC-WAXSET',
    price: 799,
    description: 'A premium wax melt gift set — ideal for gifting on festivals, weddings, housewarmings, birthdays and corporate events.',
    stock: 20,
    ratingAverage: 4.9,
    ratingCount: 56,
    images: [{ url: '/assets/Gifting/Waxset.png', alt: 'Wax Melt Gift Set' }],
  },
  'chocolate-candle-gift-set': {
    name: 'Chocolate Candle Gift Set',
    slug: 'chocolate-candle-gift-set',
    sku: 'DC-CHOCO',
    price: 549,
    description: 'A beautifully packaged chocolate-scented candle gift set — perfect for birthdays, housewarmings and special occasions.',
    stock: 25,
    ratingAverage: 4.8,
    ratingCount: 29,
    images: [{ url: '/assets/Gifting/Pasted image (3).png', alt: 'Chocolate Candle Gift Set' }],
  },
  'aroma-stone-gift-set': {
    name: 'Aroma Stone Gift Set',
    slug: 'aroma-stone-gift-set',
    sku: 'DC-AROMA-SET',
    price: 649,
    description: 'A curated set of four aroma stones in soothing Lavender, warm Fresh Vanilla, classic Kapur and zesty Lemongrass — perfect for gifting.',
    stock: 30,
    ratingAverage: 5.0,
    ratingCount: 42,
    images: [{ url: '/assets/Gifting/Pasted image (2).png', alt: 'Aroma Stone Gift Set' }],
  },
  'ocean-breeze': {
    name: 'Ocean Breeze',
    slug: 'ocean-breeze',
    sku: 'DC-OCEAN',
    price: 599,
    description: 'To elevate your room ambience in office space, homes, wash room, hotel ambience etc.',
    stock: 40,
    ratingAverage: 4.9,
    ratingCount: 38,
    images: [{ url: '/assets/Gifting/Pasted image.png', alt: 'Ocean Breeze' }],
  },
};

export async function generateStaticParams() {
  try {
    const res = await productService.list({ limit: 100 });
    return res.items.map((p) => ({ slug: p.slug }));
  } catch {
    return [
      { slug: 'wax-sachet' },
      { slug: 'wax-melt-gift-set' },
      { slug: 'chocolate-candle-gift-set' },
      { slug: 'aroma-stone-gift-set' },
      { slug: 'ocean-breeze' },
    ];
  }
}

function resolveFullImageUrl(url?: string): string {
  if (!url) return 'https://devcreation24.in/assets/Logos/Logo2.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://devcreation24.in${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let product: Partial<Product> | null = null;
  try {
    product = await productService.getBySlug(params.slug);
  } catch {
    product = FALLBACK_PRODUCTS[params.slug] || null;
  }

  const name = product?.name || 'Handcrafted Luxury Fragrance';
  const description =
    product?.description ||
    'Artisanal 100% pure soy wax sachet and home fragrance handcrafted in India by Dev Creation.';
  const url = `https://devcreation24.in/products/${params.slug}/`;

  const primaryImage = resolveFullImageUrl(product?.images?.[0]?.url);

  return {
    title: `${name} — Dev Creation`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url,
      siteName: 'Dev Creation',
      title: `${name} | Dev Creation`,
      description,
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product?.name || 'Dev Creation Product',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Dev Creation`,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product: Product | null = null;
  let related: Product[] = [];

  try {
    product = await productService.getBySlug(params.slug);
    related = await productService.related(params.slug).catch(() => []);
  } catch {
    product = (FALLBACK_PRODUCTS[params.slug] as Product) || null;
  }

  // Schema.org Product & BreadcrumbList structured data
  const targetProduct = product || FALLBACK_PRODUCTS[params.slug];
  const pageUrl = `https://devcreation24.in/products/${params.slug}/`;

  const productSchema = targetProduct
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: targetProduct.name,
        image: targetProduct.images?.length
          ? targetProduct.images.map((im) => resolveFullImageUrl(im.url))
          : ['https://devcreation24.in/assets/Logos/Logo2.png'],
        description: targetProduct.description,
        sku: targetProduct.sku || targetProduct.slug,
        brand: {
          '@type': 'Brand',
          name: 'Dev Creation',
        },
        offers: {
          '@type': 'Offer',
          url: pageUrl,
          priceCurrency: 'INR',
          price: targetProduct.price || 499,
          priceValidUntil: '2027-12-31',
          availability:
            (targetProduct.stock ?? 1) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Dev Creation',
          },
        },
        ...(targetProduct.ratingAverage
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: targetProduct.ratingAverage,
                reviewCount: targetProduct.ratingCount || 1,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://devcreation24.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collection',
        item: 'https://devcreation24.in/products/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: targetProduct?.name || 'Product',
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailWrapper
        initialProduct={product}
        initialRelated={related}
        slug={params.slug}
      />
    </>
  );
}

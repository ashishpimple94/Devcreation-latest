/**
 * Product catalogue seeded from the original Dev Creation static site
 * (the `PRODUCTS` array in dev-creation-candles.html). Image paths point at the
 * assets that ship with the storefront (frontend/public/assets/...).
 */
export interface SeedProduct {
  name: string;
  sku: string;
  type: string;
  fragrance: string;
  description: string;
  price: number;
  weight: string;
  stock: number;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  categorySlug: string;
}

export const SEED_CATEGORIES = [
  { name: 'Wax Melts', slug: 'wax-melts', description: 'Handcrafted soy wax melts.' },
  { name: 'Aroma Stones', slug: 'aroma-stones', description: 'Scented aroma stones.' },
  { name: 'Gift Sets', slug: 'gift-sets', description: 'Curated gifting collections.' },
  { name: 'Wax Sachets', slug: 'wax-sachets', description: 'Long-lasting wax sachets.' },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: 'Ocean Breeze',
    sku: 'DC-OCEAN',
    type: 'Wax Melts',
    fragrance: 'Ocean Breeze',
    description:
      'to elevate your room ambience in office space, homes, wash room, hotel ambience etc.',
    price: 599,
    weight: '50g',
    stock: 40,
    images: ['/assets/Gifting/Pasted image.png'],
    tags: ['100% Handmade', 'Long Lasting', 'Premium Quality', 'Perfect For Gifting'],
    isFeatured: true,
    categorySlug: 'wax-melts',
  },
  {
    name: 'Aroma Stone Gift Set',
    sku: 'DC-AROMA-SET',
    type: 'Aroma Stones',
    fragrance: 'Lavender · Fresh Vanilla · Kapur · Lemongrass',
    description:
      'a curated set of four aroma stones in soothing Lavender, warm Fresh Vanilla, classic Kapur and zesty Lemongrass — perfect for gifting.',
    price: 649,
    weight: '4 pcs',
    stock: 30,
    images: ['/assets/Gifting/Pasted image (2).png'],
    tags: ['100% Handmade', 'Long Lasting', 'Premium Quality', 'Perfect For Gifting'],
    isFeatured: true,
    categorySlug: 'aroma-stones',
  },
  {
    name: 'Chocolate Candle Gift Set',
    sku: 'DC-CHOCO',
    type: 'Candle Gift Set',
    fragrance: 'Chocolate',
    description:
      'a beautifully packaged chocolate-scented candle gift set — perfect for birthdays, housewarmings and special occasions.',
    price: 549,
    weight: 'Set',
    stock: 25,
    images: ['/assets/Gifting/Pasted image (3).png'],
    tags: ['100% Handmade', 'Long Lasting', 'Premium Quality', 'Perfect For Gifting'],
    isFeatured: false,
    categorySlug: 'gift-sets',
  },
  {
    name: 'Wax Melt Gift Set',
    sku: 'DC-WAXSET',
    type: 'Gift Set',
    fragrance: 'Assorted Fragrances',
    description:
      'a premium wax melt gift set — ideal for gifting on festivals, weddings, housewarmings, birthdays and corporate events.',
    price: 799,
    weight: 'Gift Box',
    stock: 20,
    images: ['/assets/Gifting/Waxset.png'],
    tags: ['100% Handmade', 'Premium Packaging', 'Assorted Scents', 'Perfect For Gifting'],
    isFeatured: true,
    categorySlug: 'gift-sets',
  },
  {
    name: 'Wax Sachet',
    sku: 'DC-SACHET',
    type: 'Wax Sachet',
    fragrance: 'Multiple Fragrances',
    description:
      'use for car, bathrooms, gifting & home decor. A long-lasting sachet that keeps your spaces fresh and fragrant.',
    price: 499,
    weight: '100g',
    stock: 60,
    images: ['/assets/Gifting/1.jpeg', '/assets/Gifting/2.jpeg', '/assets/Gifting/3.jpeg'],
    tags: ['100% Handmade', 'Long Lasting', 'Premium Quality', 'Perfect For Gifting'],
    isFeatured: false,
    categorySlug: 'wax-sachets',
  },
];

import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().default(''),
  isPrimary: z.boolean().optional().default(false),
});

const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().int().min(0),
});

export const createProductSchema = {
  body: z.object({
    name: z.string().min(2).max(140),
    sku: z.string().min(2).max(60).optional(),
    type: z.string().min(1),
    fragrance: z.string().optional().default(''),
    description: z.string().optional().default(''),
    category: z.string().length(24).optional().nullable().or(z.literal('')),
    price: z.number().min(0),
    compareAtPrice: z.number().min(0).optional().nullable(),
    discountPercent: z.number().min(0).max(100).optional().default(0),
    weight: z.string().optional(),
    stock: z.number().int().min(0).default(0),
    images: z.array(imageSchema).optional().default([]),
    variants: z.array(variantSchema).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
  }),
};

export const updateProductSchema = {
  body: createProductSchema.body.partial(),
};

export const listProductsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc', 'popular']).optional(),
    featured: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    includeInactive: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
  }),
};

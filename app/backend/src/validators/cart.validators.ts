import { z } from 'zod';

export const addItemSchema = {
  body: z.object({
    productId: z.string().length(24),
    quantity: z.number().int().min(1).max(99).default(1),
    variantSku: z.string().optional(),
  }),
};

export const updateItemSchema = {
  body: z.object({
    productId: z.string().length(24),
    quantity: z.number().int().min(0).max(99),
    variantSku: z.string().optional(),
  }),
};

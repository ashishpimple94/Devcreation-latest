import { z } from 'zod';

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().min(6).max(20).optional(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
  }),
};

export const addressSchema = {
  body: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6).max(20),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3).max(12),
    country: z.string().min(2).default('India'),
    isDefault: z.boolean().optional(),
  }),
};

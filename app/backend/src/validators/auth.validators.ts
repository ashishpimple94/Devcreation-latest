import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name is too short').max(80),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long'),
    phone: z.string().min(6).max(20).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().min(3, 'Email or mobile number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Enter a valid email'),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(10),
    password: z.string().min(8).max(72),
  }),
};

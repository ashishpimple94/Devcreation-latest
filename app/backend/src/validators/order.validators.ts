import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_METHOD } from '@/constants';

const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6).max(20),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3).max(12),
  country: z.string().min(2).default('India'),
});

export const checkoutSchema = {
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z
      .enum([PAYMENT_METHOD.COD, PAYMENT_METHOD.CARD, PAYMENT_METHOD.UPI, PAYMENT_METHOD.NETBANKING])
      .default(PAYMENT_METHOD.COD),
    promoCode: z.string().trim().optional(),
  }),
};

export const updateOrderStatusSchema = {
  body: z.object({
    status: z.enum([
      ORDER_STATUS.PENDING,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.REFUNDED,
    ]),
    note: z.string().max(300).optional(),
  }),
};

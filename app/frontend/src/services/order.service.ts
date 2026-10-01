import { api } from '@/lib/api';
import type { Order, Address, ShippingAddress, PaymentMethod, PageMeta } from '@/types';

export const orderService = {
  async listMine(page = 1): Promise<{ items: Order[]; meta?: PageMeta }> {
    const res = await api.get<Order[]>(`/orders?page=${page}&limit=10`);
    return { items: res.data, meta: res.meta };
  },

  async getMine(id: string): Promise<Order> {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },

  async checkout(shippingAddress: ShippingAddress, paymentMethod: PaymentMethod, promoCode?: string): Promise<Order> {
    const res = await api.post<Order>('/orders/checkout', { shippingAddress, paymentMethod, promoCode });
    return res.data;
  },

  async cancel(id: string): Promise<Order> {
    const res = await api.post<Order>(`/orders/${id}/cancel`);
    return res.data;
  },

  async addresses(): Promise<Address[]> {
    const res = await api.get<Address[]>('/users/me/addresses');
    return res.data;
  },
};

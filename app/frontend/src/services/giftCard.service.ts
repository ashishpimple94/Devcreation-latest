import { api } from '@/lib/api';
import type { AppliedGiftCard, GiftCardInfo } from '@/types';

export const giftCardService = {
  async validate(code: string, subtotal: number): Promise<AppliedGiftCard> {
    const res = await api.post<AppliedGiftCard>('/gift-cards/validate', {
      code,
      subtotal,
    });
    return res.data;
  },

  async getAvailable(): Promise<GiftCardInfo[]> {
    const res = await api.get<GiftCardInfo[]>('/gift-cards/available');
    return res.data;
  },
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { giftCardService } from '@/services/giftCard.service';
import type { Cart, AppliedGiftCard } from '@/types';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  count: number;
  appliedGiftCard: AppliedGiftCard | null;
  open: () => void;
  close: () => void;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number, variantSku?: string) => Promise<void>;
  update: (productId: string, quantity: number, variantSku?: string) => Promise<void>;
  remove: (productId: string, variantSku?: string) => Promise<void>;
  clear: () => Promise<void>;
  applyGiftCard: (code: string) => Promise<AppliedGiftCard>;
  removeGiftCard: () => void;
  getDiscount: () => number;
  getFinalTotal: () => number;
  reset: () => void;
}

const EMPTY: Cart = { items: [], itemsTotal: 0, shippingFee: 0, total: 0 };

function countItems(cart: Cart | null): number {
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}

function recalculateGiftCard(card: AppliedGiftCard | null, subtotal: number): AppliedGiftCard | null {
  if (!card) return null;
  if (subtotal < card.minOrderValue) {
    return { ...card, discount: 0 };
  }
  let discount = 0;
  if (card.discountType === 'flat') {
    discount = Math.min(subtotal, card.discountValue);
  } else if (card.discountType === 'percentage') {
    discount = Math.round((subtotal * card.discountValue) / 100);
    if (card.maxDiscount && discount > card.maxDiscount) {
      discount = card.maxDiscount;
    }
    discount = Math.min(subtotal, discount);
  }
  return { ...card, discount };
}

/**
 * Cart store. The server owns the cart for authenticated users; this store
 * mirrors it, tracks applied gift cards / vouchers, and exposes the drawer state.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      loading: false,
      count: 0,
      appliedGiftCard: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      async refresh() {
        set({ loading: true });
        try {
          const res = await api.get<Cart>('/cart');
          const updatedCard = recalculateGiftCard(get().appliedGiftCard, res.data.itemsTotal);
          set({ cart: res.data, count: countItems(res.data), appliedGiftCard: updatedCard });
        } finally {
          set({ loading: false });
        }
      },

      async add(productId, quantity = 1, variantSku) {
        const res = await api.post<Cart>('/cart/items', { productId, quantity, variantSku });
        const updatedCard = recalculateGiftCard(get().appliedGiftCard, res.data.itemsTotal);
        set({ cart: res.data, count: countItems(res.data), isOpen: true, appliedGiftCard: updatedCard });
      },

      async update(productId, quantity, variantSku) {
        const res = await api.patch<Cart>('/cart/items', { productId, quantity, variantSku });
        const updatedCard = recalculateGiftCard(get().appliedGiftCard, res.data.itemsTotal);
        set({ cart: res.data, count: countItems(res.data), appliedGiftCard: updatedCard });
      },

      async remove(productId, variantSku) {
        const query = variantSku ? `?variantSku=${encodeURIComponent(variantSku)}` : '';
        const res = await api.delete<Cart>(`/cart/items/${productId}${query}`);
        const updatedCard = recalculateGiftCard(get().appliedGiftCard, res.data.itemsTotal);
        set({ cart: res.data, count: countItems(res.data), appliedGiftCard: updatedCard });
      },

      async clear() {
        const res = await api.delete<Cart>('/cart');
        set({ cart: res.data, count: 0, appliedGiftCard: null });
      },

      async applyGiftCard(code: string) {
        const { cart } = get();
        const subtotal = cart?.itemsTotal ?? 0;
        const validated = await giftCardService.validate(code, subtotal);
        set({ appliedGiftCard: validated });
        return validated;
      },

      removeGiftCard() {
        set({ appliedGiftCard: null });
      },

      getDiscount() {
        const { appliedGiftCard } = get();
        return appliedGiftCard?.discount ?? 0;
      },

      getFinalTotal() {
        const { cart, appliedGiftCard } = get();
        if (!cart) return 0;
        const discount = appliedGiftCard?.discount ?? 0;
        return Math.max(0, cart.itemsTotal - discount) + cart.shippingFee;
      },

      reset: () => set({ cart: EMPTY, count: 0, isOpen: false, appliedGiftCard: null }),
    }),
    {
      name: 'dev-creation-cart-promo',
      partialize: (state) => ({ appliedGiftCard: state.appliedGiftCard }),
    },
  ),
);

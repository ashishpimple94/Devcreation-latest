import { GiftCard } from '@/models/GiftCard';
import { ApiError } from '@/utils/ApiError';

export interface ValidatedGiftCard {
  code: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discount: number;
  minOrderValue: number;
}

export const giftCardService = {
  /**
   * Validates a gift card or redeem code against the cart subtotal.
   */
  async validate(rawCode: string, subtotal: number): Promise<ValidatedGiftCard> {
    if (!rawCode || !rawCode.trim()) {
      throw ApiError.badRequest('Please enter a valid gift card or promo code');
    }

    const code = rawCode.trim().toUpperCase();
    const card = await GiftCard.findOne({ code, isActive: true });

    if (!card) {
      throw ApiError.notFound('Invalid or expired gift card code');
    }

    if (card.expiresAt && card.expiresAt.getTime() < Date.now()) {
      throw ApiError.badRequest('This gift card code has expired');
    }

    if (card.usageLimit && card.usedCount >= card.usageLimit) {
      throw ApiError.badRequest('This gift card has already reached its redemption limit');
    }

    if (subtotal < card.minOrderValue) {
      throw ApiError.badRequest(
        `Minimum order amount of ₹${card.minOrderValue} required for code ${card.code}`,
      );
    }

    // Calculate discount amount
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

    return {
      code: card.code,
      description: card.description,
      discountType: card.discountType,
      discountValue: card.discountValue,
      discount,
      minOrderValue: card.minOrderValue,
    };
  },

  /**
   * Records usage after an order is successfully created.
   */
  async recordUsage(code: string) {
    if (!code) return;
    await GiftCard.updateOne({ code: code.trim().toUpperCase() }, { $inc: { usedCount: 1 } });
  },

  /**
   * Lists all gift cards for the admin panel.
   */
  async listAll() {
    return GiftCard.find().sort({ createdAt: -1 }).lean();
  },

  /**
   * Creates a new gift card / promo code from admin.
   */
  async create(data: {
    code: string;
    description: string;
    discountType: 'flat' | 'percentage';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    expiresAt?: Date | string;
    usageLimit?: number;
  }) {
    const code = data.code.trim().toUpperCase();
    const existing = await GiftCard.findOne({ code });
    if (existing) {
      throw ApiError.badRequest(`Gift card with code ${code} already exists`);
    }

    const created = await GiftCard.create({
      code,
      description: data.description.trim(),
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      isActive: true,
    });
    return created.toObject();
  },

  /**
   * Toggles the active status of a gift card.
   */
  async toggleActive(id: string) {
    const card = await GiftCard.findById(id);
    if (!card) throw ApiError.notFound('Gift card not found');
    card.isActive = !card.isActive;
    await card.save();
    return card.toObject();
  },

  /**
   * Deletes a gift card.
   */
  async remove(id: string) {
    const card = await GiftCard.findByIdAndDelete(id);
    if (!card) throw ApiError.notFound('Gift card not found');
    return card.toObject();
  },

  /**
   * Seeds initial default redeem codes if none exist.
   */
  async seedDefaults() {
    const defaultCodes = [
      {
        code: 'DEV100',
        description: 'Flat ₹100 Gift Voucher on orders above ₹499',
        discountType: 'flat' as const,
        discountValue: 100,
        minOrderValue: 499,
        isActive: true,
      },
      {
        code: 'WELCOME10',
        description: '10% Welcome Discount on all orders',
        discountType: 'percentage' as const,
        discountValue: 10,
        minOrderValue: 0,
        isActive: true,
      },
      {
        code: 'LUXURY20',
        description: '20% off on Luxury collections over ₹999 (Max ₹500)',
        discountType: 'percentage' as const,
        discountValue: 20,
        minOrderValue: 999,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'GIFT500',
        description: 'Flat ₹500 VIP Gift Card on orders above ₹1,499',
        discountType: 'flat' as const,
        discountValue: 500,
        minOrderValue: 1499,
        isActive: true,
      },
    ];

    for (const d of defaultCodes) {
      await GiftCard.findOneAndUpdate(
        { code: d.code },
        { $setOnInsert: d },
        { upsert: true, new: true },
      );
    }
  },
};

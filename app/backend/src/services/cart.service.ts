import { Types } from 'mongoose';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import { ApiError } from '@/utils/ApiError';

/** Resolves the price of a product or a specific variant. */
function resolvePrice(product: { price: number; variants: { sku: string; price: number }[] }, variantSku?: string) {
  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) throw ApiError.badRequest('Selected variant is unavailable');
    return variant.price;
  }
  return product.price;
}

export const cartService = {
  /** Returns the user's cart with product details and computed totals. */
  async get(userId: string) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId, items: [] } },
      { new: true, upsert: true },
    )
      .populate('items.product', 'name slug price images stock variants type weight')
      .lean();

    const items = (cart.items ?? [])
      .filter((i) => i.product) // drop items whose product was deleted
      .map((item) => {
        const product = item.product as unknown as {
          _id: Types.ObjectId;
          name: string;
          slug: string;
          price: number;
          images: { url: string; isPrimary?: boolean }[];
          stock: number;
          variants: { sku: string; price: number; name: string }[];
          weight?: string;
        };
        const unitPrice = resolvePrice(product, item.variantSku);
        return {
          product: {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            image: product.images?.find((im) => im.isPrimary)?.url ?? product.images?.[0]?.url,
            stock: product.stock,
            weight: product.weight,
          },
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      });

    const itemsTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const shippingFee = itemsTotal === 0 || itemsTotal >= 999 ? 0 : 99;
    return { items, itemsTotal, shippingFee, total: itemsTotal + shippingFee };
  },

  async addItem(userId: string, productId: string, quantity: number, variantSku?: string) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw ApiError.notFound('Product not found');
    if (product.stock < quantity) throw ApiError.badRequest('Not enough stock available');

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: userId } },
      { new: true, upsert: true },
    );

    const existing = cart.items.find(
      (i) => i.product.toString() === productId && i.variantSku === variantSku,
    );
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: new Types.ObjectId(productId), variantSku, quantity });

    await cart.save();
    return this.get(userId);
  },

  async updateItem(userId: string, productId: string, quantity: number, variantSku?: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart not found');
    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.variantSku === variantSku,
    );
    if (!item) throw ApiError.notFound('Item not in cart');
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i !== item);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    return this.get(userId);
  },

  async removeItem(userId: string, productId: string, variantSku?: string) {
    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: new Types.ObjectId(productId), variantSku } } },
    );
    return this.get(userId);
  },

  async clear(userId: string) {
    await Cart.updateOne({ user: userId }, { $set: { items: [] } });
    return this.get(userId);
  },
};

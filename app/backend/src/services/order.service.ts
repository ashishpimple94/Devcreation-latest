import mongoose, { Types, type FilterQuery } from 'mongoose';
import { Order, type IOrder } from '@/models/Order';
import { Product } from '@/models/Product';
import { Cart } from '@/models/Cart';
import { ApiError } from '@/utils/ApiError';
import { supportsTransactions } from '@/config/db';
import { getPageParams, buildPageMeta } from '@/utils/pagination';
import { generateOrderNumber } from '@/utils/slug';
import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS,
  LOW_STOCK_THRESHOLD,
  type OrderStatus,
  type PaymentMethod,
} from '@/constants';
import { notificationService } from '@/services/notification.service';
import { emailService } from '@/services/email.service';
import { cache } from '@/redis/cache';
import { CACHE } from '@/constants';
import { logger } from '@/utils/logger';
import { giftCardService } from '@/services/giftCard.service';

interface CheckoutInput {
  shippingAddress: IOrder['shippingAddress'];
  paymentMethod: PaymentMethod;
  promoCode?: string;
}

const STATUS_MESSAGE: Record<OrderStatus, (n: string) => string> = {
  [ORDER_STATUS.PENDING]: (n) => `Order ${n} has been placed`,
  [ORDER_STATUS.CONFIRMED]: (n) => `Order ${n} has been confirmed`,
  [ORDER_STATUS.PROCESSING]: (n) => `Order ${n} is being processed`,
  [ORDER_STATUS.SHIPPED]: (n) => `Order ${n} has been shipped`,
  [ORDER_STATUS.DELIVERED]: (n) => `Order ${n} has been delivered`,
  [ORDER_STATUS.CANCELLED]: (n) => `Order ${n} has been cancelled`,
  [ORDER_STATUS.REFUNDED]: (n) => `Order ${n} has been refunded`,
};

export const orderService = {
  /**
   * Creates an order from the user's cart inside a transaction: validates stock,
   * snapshots line items, atomically decrements inventory, clears the cart and
   * notifies staff of the new order. MongoDB remains the source of truth.
   */
  async checkout(userId: string, input: CheckoutInput) {
    const cart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'name sku price images stock variants isActive',
    );
    if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

    const lowStockProducts: { id: string; name: string; stock: number }[] = [];

    /**
     * Core order-placement steps. Runs inside a transaction when the MongoDB
     * topology supports it (replica set / Atlas), otherwise runs directly.
     * `session` is undefined on standalone MongoDB.
     */
    const placeOrder = async (session?: mongoose.ClientSession): Promise<IOrder> => {
      const items: IOrder['items'] = [];
      let itemsTotal = 0;

      for (const cartItem of cart.items) {
        const product = cartItem.product as unknown as {
          _id: Types.ObjectId;
          name: string;
          sku: string;
          price: number;
          images: { url: string; isPrimary?: boolean }[];
          stock: number;
          isActive: boolean;
          variants: { sku: string; price: number; name: string; stock: number }[];
        };
        if (!product || !product.isActive) {
          throw ApiError.badRequest('A product in your cart is no longer available');
        }

        const variant = cartItem.variantSku
          ? product.variants.find((v) => v.sku === cartItem.variantSku)
          : undefined;
        const unitPrice = variant ? variant.price : product.price;

        // Atomic conditional stock decrement — prevents overselling under concurrency.
        const dec = await Product.updateOne(
          { _id: product._id, stock: { $gte: cartItem.quantity } },
          { $inc: { stock: -cartItem.quantity } },
          session ? { session } : {},
        );
        if (dec.modifiedCount === 0) {
          throw ApiError.badRequest(`Not enough stock for ${product.name}`);
        }

        items.push({
          product: product._id,
          name: product.name,
          sku: variant?.sku ?? product.sku,
          variantName: variant?.name,
          price: unitPrice,
          quantity: cartItem.quantity,
          image: product.images?.find((im) => im.isPrimary)?.url ?? product.images?.[0]?.url,
        });
        itemsTotal += unitPrice * cartItem.quantity;

        const remaining = product.stock - cartItem.quantity;
        if (remaining <= LOW_STOCK_THRESHOLD) {
          lowStockProducts.push({ id: product._id.toString(), name: product.name, stock: remaining });
        }
      }

      let discount = 0;
      let appliedPromoCode: string | undefined = undefined;
      if (input.promoCode) {
        const promo = await giftCardService.validate(input.promoCode, itemsTotal);
        discount = promo.discount;
        appliedPromoCode = promo.code;
      }

      const shippingFee = itemsTotal >= 999 ? 0 : 99;
      const finalTotal = Math.max(0, itemsTotal - discount) + shippingFee;
      const orderNumber = generateOrderNumber();

      const [order] = await Order.create(
        [
          {
            orderNumber,
            user: new Types.ObjectId(userId),
            items,
            shippingAddress: input.shippingAddress,
            itemsTotal,
            shippingFee,
            discount,
            promoCode: appliedPromoCode,
            total: finalTotal,
            status: ORDER_STATUS.PENDING,
            paymentMethod: input.paymentMethod,
            paymentStatus: PAYMENT_STATUS.PENDING,
            statusHistory: [
              { status: ORDER_STATUS.PENDING, note: 'Order placed', changedAt: new Date() },
            ],
          },
        ],
        session ? { session } : {},
      );
      if (appliedPromoCode) {
        await giftCardService.recordUsage(appliedPromoCode);
      }
      cart.items = [];
      await cart.save(session ? { session } : {});
      return order;
    };

    let created: IOrder;
    if (await supportsTransactions()) {
      const session = await mongoose.startSession();
      try {
        let result: IOrder | undefined;
        await session.withTransaction(async () => {
          result = await placeOrder(session);
        });
        if (!result) throw ApiError.internal('Failed to create order');
        created = result;
      } finally {
        await session.endSession();
      }
    } else {
      // Standalone MongoDB (dev): no transaction available. The conditional
      // stock decrement still guards against overselling per item.
      created = await placeOrder();
    }

    await cache.del(CACHE.KEY.dashboard());
    await this.invalidateProductCaches();

    // Notify staff of the new order + confirm to the customer.
    await notificationService.create({
      type: 'new_order',
      title: 'New order received',
      message: `Order ${created.orderNumber} · ₹${created.total.toLocaleString('en-IN')}`,
      forStaff: true,
      relatedEntity: { kind: 'order', id: created._id.toString(), ref: created.orderNumber },
      dashboardDirty: true,
    });
    await notificationService.create({
      type: 'order_status',
      title: 'Order placed',
      message: STATUS_MESSAGE[ORDER_STATUS.PENDING](created.orderNumber),
      userId,
      relatedEntity: { kind: 'order', id: created._id.toString(), ref: created.orderNumber },
    });

    for (const lp of lowStockProducts) {
      await notificationService.create({
        type: 'low_stock',
        title: 'Low stock',
        message: `${lp.name} is low on stock (${lp.stock} left)`,
        forStaff: true,
        relatedEntity: { kind: 'product', id: lp.id },
        dashboardDirty: true,
      });
    }

    // Fire-and-forget emails: customer confirmation (+ invoice) and admin alert.
    void emailService.sendOrderPlaced(created).catch((err) =>
      logger.warn('Order-placed email failed', { orderId: created!._id.toString(), err: (err as Error).message }),
    );

    return created.toObject();
  },

  async listForUser(userId: string, query: Record<string, unknown>) {
    const { page, limit, skip } = getPageParams(query);
    const filter: FilterQuery<IOrder> = { user: new Types.ObjectId(userId) };
    if (query.status) filter.status = query.status as OrderStatus;
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },

  async getForUser(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  async cancelByUser(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw ApiError.notFound('Order not found');
    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(ORDER_STATUS.CANCELLED)) {
      throw ApiError.badRequest(`An order that is ${order.status} can no longer be cancelled`);
    }
    return this.changeStatus(orderId, ORDER_STATUS.CANCELLED, userId, 'Cancelled by customer');
  },

  // ---- Admin ----

  async adminList(query: Record<string, unknown>) {
    const { page, limit, skip } = getPageParams(query);
    const filter: FilterQuery<IOrder> = {};
    if (query.status) filter.status = query.status as OrderStatus;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.search) {
      filter.orderNumber = { $regex: String(query.search).trim(), $options: 'i' };
    }
    const sort: Record<string, 1 | -1> =
      query.sort === 'amount_desc'
        ? { total: -1 }
        : query.sort === 'amount_asc'
          ? { total: 1 }
          : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit).populate('user', 'name email').lean(),
      Order.countDocuments(filter),
    ]);
    return { items, meta: buildPageMeta(total, page, limit) };
  },

  async adminGet(orderId: string) {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('statusHistory.changedBy', 'name role')
      .lean();
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  /**
   * Transitions an order to a new status. Enforces the allowed transition graph,
   * appends to the audit trail, restocks on cancel/refund, and emits a real-time
   * notification to the owning customer.
   */
  async changeStatus(orderId: string, next: OrderStatus, actorId: string, note?: string) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    const allowed = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(next)) {
      throw ApiError.badRequest(`Cannot change order from ${order.status} to ${next}`);
    }

    // Return stock to inventory when an order is cancelled or refunded.
    if (next === ORDER_STATUS.CANCELLED || next === ORDER_STATUS.REFUNDED) {
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }),
        ),
      );
      if (next === ORDER_STATUS.REFUNDED) order.paymentStatus = PAYMENT_STATUS.REFUNDED;
      await this.invalidateProductCaches();
    }

    if (next === ORDER_STATUS.DELIVERED && order.paymentMethod === 'cod') {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    order.status = next;
    order.statusHistory.push({
      status: next,
      note,
      changedBy: new Types.ObjectId(actorId),
      changedAt: new Date(),
    });
    await order.save();
    await cache.del(CACHE.KEY.dashboard());

    // Real-time notification to the customer (persisted + published).
    await notificationService.create({
      type: next === ORDER_STATUS.CANCELLED ? 'order_cancelled' : 'order_status',
      title: 'Order update',
      message: STATUS_MESSAGE[next](order.orderNumber),
      userId: order.user.toString(),
      relatedEntity: { kind: 'order', id: order._id.toString(), ref: order.orderNumber },
      dashboardDirty: true,
    });

    // Fire-and-forget status-update email to the customer.
    void emailService.sendOrderStatus(order, next, note).catch((err) =>
      logger.warn('Order-status email failed', { orderId, err: (err as Error).message }),
    );

    logger.info('Order status changed', {
      orderId,
      from: allowed,
      to: next,
      actorId,
    });
    return order.toObject();
  },

  async invalidateProductCaches() {
    await cache.delByPattern(CACHE.PATTERN.productLists);
    await cache.delByPattern(CACHE.PATTERN.products);
  },
};

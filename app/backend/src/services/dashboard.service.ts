import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { cache } from '@/redis/cache';
import { CACHE, ORDER_STATUS, LOW_STOCK_THRESHOLD, ROLES } from '@/constants';

export const dashboardService = {
  /**
   * Aggregated dashboard metrics. Cached briefly (60s) in Redis because these
   * queries are expensive and the dashboard is polled/refreshed frequently.
   * The cache key is busted on order/product writes so numbers stay fresh.
   */
  async stats() {
    return cache.remember(CACHE.KEY.dashboard(), CACHE.TTL.DASHBOARD, async () => {
      const [
        revenueAgg,
        totalOrders,
        pending,
        confirmed,
        processing,
        shipped,
        completed,
        cancelled,
        refunded,
        totalCustomers,
        totalProducts,
        lowStock,
        recentOrders,
        recentCustomers,
        salesByDay,
        topProducts,
      ] = await Promise.all([
        Order.aggregate([
          { $match: { status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED] } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.countDocuments(),
        Order.countDocuments({ status: ORDER_STATUS.PENDING }),
        Order.countDocuments({ status: ORDER_STATUS.CONFIRMED }),
        Order.countDocuments({ status: ORDER_STATUS.PROCESSING }),
        Order.countDocuments({ status: ORDER_STATUS.SHIPPED }),
        Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
        Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
        Order.countDocuments({ status: ORDER_STATUS.REFUNDED }),
        User.countDocuments({ role: ROLES.CUSTOMER }),
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
        Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email').lean(),
        User.find({ role: ROLES.CUSTOMER }).sort({ createdAt: -1 }).limit(6).lean(),
        // Revenue + order count for the last 14 days (analytics chart).
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
              status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED] },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$total' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Best-selling products by units sold (product performance).
        Order.aggregate([
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: { $first: '$items.name' },
              unitsSold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $sort: { unitsSold: -1 } },
          { $limit: 5 },
        ]),
      ]);

      return {
        totals: {
          revenue: revenueAgg[0]?.total ?? 0,
          orders: totalOrders,
          pendingOrders: pending,
          confirmedOrders: confirmed,
          processingOrders: processing,
          shippedOrders: shipped,
          completedOrders: completed,
          cancelledOrders: cancelled,
          refundedOrders: refunded,
          customers: totalCustomers,
          products: totalProducts,
          lowStockProducts: lowStock,
        },
        recentOrders,
        recentCustomers,
        salesByDay,
        topProducts,
      };
    });
  },
};

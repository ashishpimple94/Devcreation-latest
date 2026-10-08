import { User } from '@/models/User';
import type { IOrder } from '@/models/Order';
import type { OrderStatus } from '@/constants';
import { env } from '@/config/env';
import { mailQueue } from '@/services/mailQueue.service';
import { logger } from '@/utils/logger';
import { generateInvoicePdf } from '@/utils/invoice';
import {
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusEmail,
  welcomeEmail,
  passwordResetEmail,
} from '@/emails/templates';

/** Resolves the customer's name + email for an order (order.user may be an id or populated object). */
async function resolveCustomer(order: IOrder): Promise<{ name: string; email: string } | null> {
  const userObj = order.user as unknown as { _id?: string; name?: string; email?: string } | undefined;
  if (userObj && typeof userObj === 'object' && userObj.email) {
    return { name: userObj.name || order.shippingAddress.fullName, email: userObj.email };
  }
  const userId = userObj?._id || order.user;
  if (!userId) return { name: order.shippingAddress.fullName, email: '' };
  const user = await User.findById(userId).select('name email').lean();
  if (!user) return { name: order.shippingAddress.fullName, email: '' };
  return { name: user.name, email: user.email };
}

/**
 * Scalable Order-Related Transactional Email Service.
 * Powered by an asynchronous, concurrency-controlled background queue (`mailQueue`).
 * 
 * - API requests return in milliseconds without waiting on SMTP roundtrips.
 * - Concurrency is capped to protect SMTP server connections.
 * - Deduplication guards against accidental duplicate status clicks.
 */
export const emailService = {
  /** On checkout: async confirmation (with PDF invoice) to customer + alert to admin. */
  async sendOrderPlaced(order: IOrder): Promise<void> {
    const customer = await resolveCustomer(order);
    const name = customer?.name ?? order.shippingAddress.fullName;

    // 1. Customer Confirmation Email
    if (customer?.email) {
      // Generate invoice asynchronously in memory
      let invoice: Buffer | undefined;
      try {
        invoice = await generateInvoicePdf(order, name);
      } catch (err) {
        logger.warn('Invoice generation warning', { orderId: order._id.toString(), err: (err as Error).message });
      }

      const tpl = orderConfirmationEmail(order, name);
      mailQueue.enqueue({
        dedupKey: `order_placed_cust_${order._id.toString()}`,
        to: customer.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        priority: 'high',
        attachments: invoice
          ? [{ filename: `invoice-${order.orderNumber}.pdf`, content: invoice, contentType: 'application/pdf' }]
          : undefined,
      });
    }

    // 2. Admin Store Alert Email
    const adminEmail = env.ADMIN_NOTIFY_EMAIL || env.SEED_ADMIN_EMAIL || 'support@devcreation24.in';
    if (adminEmail) {
      const adminTpl = adminNewOrderEmail(order, name);
      mailQueue.enqueue({
        dedupKey: `order_placed_admin_${order._id.toString()}`,
        to: adminEmail,
        subject: adminTpl.subject,
        html: adminTpl.html,
        text: adminTpl.text,
        priority: 'normal',
      });
    }

    logger.info(`[EMAIL-SERVICE] 📨 Queued order-placed emails for Order #${order.orderNumber}`);
  },

  /** On status change (Confirmed, Packing, Shipped, Delivered): notify customer asynchronously. */
  async sendOrderStatus(order: IOrder, status: OrderStatus, note?: string): Promise<void> {
    const customer = await resolveCustomer(order);
    if (!customer?.email) {
      logger.info(`[EMAIL-SERVICE] ⏭️ Skipping order status email for Order #${order.orderNumber} (no customer email found)`);
      return;
    }

    const tpl = orderStatusEmail(order, customer.name, status, note);
    mailQueue.enqueue({
      dedupKey: `order_status_${order._id.toString()}_${status}`,
      to: customer.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      priority: status === 'shipped' || status === 'delivered' ? 'high' : 'normal',
    });

    logger.info(`[EMAIL-SERVICE] 📨 Queued status email "${status}" for Order #${order.orderNumber} to <${customer.email}>`);
  },

  /** On registration: send a welcome email to the customer. */
  async sendWelcome(user: { name: string; email: string }): Promise<void> {
    if (!user.email) return;
    const tpl = welcomeEmail(user.name);
    mailQueue.enqueue({
      dedupKey: `welcome_${user.email}`,
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
    });
  },

  /** On forgot password: send password reset email with token link. */
  async sendPasswordReset(user: { name: string; email: string }, token: string): Promise<void> {
    if (!user.email) return;
    const resetUrl = `${env.STORE_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const tpl = passwordResetEmail(user.name, resetUrl);
    mailQueue.enqueue({
      to: user.email,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text,
      priority: 'high',
    });
  },
};

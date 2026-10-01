import { User } from '@/models/User';
import type { IOrder } from '@/models/Order';
import type { OrderStatus } from '@/constants';
import { env } from '@/config/env';
import { sendMail } from '@/config/mailer';
import { logger } from '@/utils/logger';
import { generateInvoicePdf } from '@/utils/invoice';
import {
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusEmail,
} from '@/emails/templates';

/** Resolves the customer's name + email for an order (order.user may be an id). */
async function resolveCustomer(order: IOrder): Promise<{ name: string; email: string } | null> {
  const user = await User.findById(order.user).select('name email').lean();
  if (!user) return { name: order.shippingAddress.fullName, email: '' };
  return { name: user.name, email: user.email };
}

/**
 * Order-related transactional emails. All methods are best-effort: failures are
 * logged and swallowed so they never disrupt the order flow. Callers invoke
 * these fire-and-forget.
 */
export const emailService = {
  /** On checkout: confirmation (with PDF invoice) to the customer + alert to admin. */
  async sendOrderPlaced(order: IOrder): Promise<void> {
    const customer = await resolveCustomer(order);
    const name = customer?.name ?? order.shippingAddress.fullName;

    // Generate the invoice once, attach to the customer email.
    let invoice: Buffer | undefined;
    try {
      invoice = await generateInvoicePdf(order, name);
    } catch (err) {
      logger.warn('Invoice generation failed', { orderId: order._id.toString(), err: (err as Error).message });
    }

    if (customer?.email) {
      const tpl = orderConfirmationEmail(order, name);
      await sendMail({
        to: customer.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        attachments: invoice
          ? [{ filename: `invoice-${order.orderNumber}.pdf`, content: invoice, contentType: 'application/pdf' }]
          : undefined,
      });
    }

    // Admin alert.
    const adminEmail = env.ADMIN_NOTIFY_EMAIL || env.SEED_ADMIN_EMAIL;
    if (adminEmail) {
      const adminTpl = adminNewOrderEmail(order, name);
      await sendMail({ to: adminEmail, subject: adminTpl.subject, html: adminTpl.html, text: adminTpl.text });
    }
  },

  /** On status change: notify the customer. */
  async sendOrderStatus(order: IOrder, status: OrderStatus, note?: string): Promise<void> {
    const customer = await resolveCustomer(order);
    if (!customer?.email) return;
    const tpl = orderStatusEmail(order, customer.name, status, note);
    await sendMail({ to: customer.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
  },
};

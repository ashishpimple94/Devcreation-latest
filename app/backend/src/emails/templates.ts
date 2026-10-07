import { env } from '@/config/env';
import type { IOrder, IOrderItem } from '@/models/Order';
import type { OrderStatus } from '@/constants';

const rupee = (n: number) => 'Rs. ' + Math.round(n).toLocaleString('en-IN');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Basic, clean responsive email shell for 100% deliverability across all mail clients. */
function layout(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Creation</title>
</head>
<body style="margin:0;padding:20px 10px;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#1e293b;line-height:1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <!-- Header -->
    <tr>
      <td style="background-color:#2C1810;padding:20px 24px;text-align:left;">
        <h1 style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:1px;">DEV CREATION</h1>
        <p style="margin:4px 0 0;font-size:11px;color:#d4af37;text-transform:uppercase;letter-spacing:0.5px;">Handcrafted With Love, Scented With Care</p>
      </td>
    </tr>
    <!-- Content Body -->
    <tr>
      <td style="padding:24px;">
        ${bodyHtml}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#64748b;">
        <p style="margin:2px 0;"><strong>Dev Creation</strong> &bull; support@devcreation24.in</p>
        <p style="margin:2px 0;"><a href="${env.STORE_URL}" style="color:#2C1810;text-decoration:none;">devcreation24.in</a></p>
        <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Dev Creation. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background-color:#2C1810;color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 20px;border-radius:6px;margin-top:12px;">${esc(label)}</a>`;
}

function itemsTable(items: IOrderItem[]): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;">
          <strong>${esc(i.name)}</strong>${i.variantName ? ` <span style="color:#64748b;">(${esc(i.variantName)})</span>` : ''}
          <div style="font-size:12px;color:#64748b;">Quantity: ${i.quantity}</div>
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#1e293b;white-space:nowrap;">
          ${rupee(i.price * i.quantity)}
        </td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;">${rows}</table>`;
}

function addressBlock(order: IOrder): string {
  const a = order.shippingAddress;
  return `<div style="font-size:13px;color:#334155;line-height:1.5;background:#f8fafc;padding:12px 14px;border-radius:6px;border:1px solid #e2e8f0;">
    <strong>${esc(a.fullName)}</strong><br>
    ${esc(a.line1)}${a.line2 ? ', ' + esc(a.line2) : ''}<br>
    ${esc(a.city)}, ${esc(a.state)} - ${esc(a.postalCode)}<br>
    Phone: ${esc(a.phone)}
  </div>`;
}

/** Basic customer order-confirmation email. */
export function orderConfirmationEmail(order: IOrder, customerName: string) {
  const body = `
    <h2 style="margin:0 0 10px;font-size:18px;color:#1e293b;">Order Confirmed!</h2>
    <p style="margin:0 0 16px;font-size:14px;color:#475569;">
      Hi ${esc(customerName)}, thank you for your order! We have received your order <strong>#${esc(order.orderNumber)}</strong> and are preparing it.
    </p>

    <div style="margin:16px 0;border-top:1px solid #e2e8f0;padding-top:12px;">
      <h3 style="margin:0 0 8px;font-size:14px;color:#1e293b;text-transform:uppercase;">Items in Your Order</h3>
      ${itemsTable(order.items)}
    </div>

    <!-- Totals Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;font-size:13px;">
      <tr>
        <td style="padding:4px 0;color:#64748b;">Subtotal:</td>
        <td align="right" style="padding:4px 0;color:#1e293b;">${rupee(order.itemsTotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#64748b;">Shipping:</td>
        <td align="right" style="padding:4px 0;color:#1e293b;">${order.shippingFee ? rupee(order.shippingFee) : 'Free'}</td>
      </tr>
      <tr style="font-weight:bold;font-size:15px;">
        <td style="padding:8px 0;border-top:1px solid #e2e8f0;color:#1e293b;">Total Amount:</td>
        <td align="right" style="padding:8px 0;border-top:1px solid #e2e8f0;color:#2C1810;">${rupee(order.total)}</td>
      </tr>
    </table>

    <div style="margin:18px 0;">
      <h3 style="margin:0 0 6px;font-size:14px;color:#1e293b;text-transform:uppercase;">Delivery Address</h3>
      ${addressBlock(order)}
    </div>

    <div style="margin-top:20px;text-align:center;">
      ${button('View Order Details', `${env.STORE_URL}/account/orders`)}
    </div>`;

  return {
    subject: `Order Confirmation #${order.orderNumber} — Dev Creation`,
    html: layout(body),
    text: `Hi ${customerName}, your Dev Creation order #${order.orderNumber} is confirmed! Total: Rs. ${order.total}. Track at ${env.STORE_URL}/account/orders`,
  };
}

/** Basic admin new-order alert email. */
export function adminNewOrderEmail(order: IOrder, customerName: string) {
  const body = `
    <h2 style="margin:0 0 10px;font-size:18px;color:#1e293b;">New Order Placed: #${esc(order.orderNumber)}</h2>
    <div style="background:#f8fafc;padding:12px;border-radius:6px;margin:12px 0;font-size:13px;border:1px solid #e2e8f0;">
      <p style="margin:3px 0;"><strong>Customer:</strong> ${esc(customerName)}</p>
      <p style="margin:3px 0;"><strong>Total Amount:</strong> ${rupee(order.total)}</p>
      <p style="margin:3px 0;"><strong>Payment Method:</strong> ${esc(order.paymentMethod.toUpperCase())}</p>
      <p style="margin:3px 0;"><strong>Payment Status:</strong> ${esc(order.paymentStatus)}</p>
    </div>

    <h3 style="margin:14px 0 6px;font-size:14px;color:#1e293b;">Ordered Items</h3>
    ${itemsTable(order.items)}

    <h3 style="margin:14px 0 6px;font-size:14px;color:#1e293b;">Customer Shipping Address</h3>
    ${addressBlock(order)}

    <div style="margin-top:18px;">
      ${button('Open Order in Admin Panel', `https://login.devcreation24.in/orders`)}
    </div>`;

  return {
    subject: `[New Order] #${order.orderNumber} by ${customerName} (Rs. ${order.total})`,
    html: layout(body),
    text: `New order #${order.orderNumber} placed by ${customerName}. Total: Rs. ${order.total}. Check admin panel: https://login.devcreation24.in/orders`,
  };
}

const STATUS_TEXT: Record<OrderStatus, { title: string; desc: string }> = {
  pending: { title: 'Order Received', desc: 'We have received your order and are verifying it.' },
  confirmed: { title: 'Order Confirmed', desc: 'Your order has been confirmed and is being packed.' },
  processing: { title: 'Order in Progress', desc: 'We are preparing your handcrafted candles.' },
  shipped: { title: 'Order Shipped', desc: 'Your package is on its way to your address!' },
  delivered: { title: 'Order Delivered', desc: 'Your order has been successfully delivered. Enjoy!' },
  cancelled: { title: 'Order Cancelled', desc: 'Your order has been cancelled.' },
  refunded: { title: 'Order Refunded', desc: 'Your refund has been initiated.' },
};

/** Basic customer order status-update email. */
export function orderStatusEmail(order: IOrder, customerName: string, status: OrderStatus, note?: string) {
  const info = STATUS_TEXT[status] || { title: `Order ${status}`, desc: `Order status is now ${status}` };
  const body = `
    <h2 style="margin:0 0 10px;font-size:18px;color:#1e293b;">${esc(info.title)}</h2>
    <p style="margin:0 0 14px;font-size:14px;color:#475569;">
      Hi ${esc(customerName)}, your order <strong>#${esc(order.orderNumber)}</strong> status has been updated to: <strong>${esc(status.toUpperCase())}</strong>.
    </p>
    <p style="font-size:13px;color:#334155;">${esc(info.desc)}</p>

    ${note ? `<div style="background:#fffbeb;border:1px solid #fef3c7;padding:10px 14px;border-radius:6px;font-size:13px;color:#92400e;margin:12px 0;"><strong>Note:</strong> ${esc(note)}</div>` : ''}

    <div style="margin-top:18px;">
      ${button('Track Order', `${env.STORE_URL}/account/orders`)}
    </div>`;

  return {
    subject: `Order Update: #${order.orderNumber} is ${status.toUpperCase()} — Dev Creation`,
    html: layout(body),
    text: `Hi ${customerName}, order #${order.orderNumber} is now ${status}. Track at ${env.STORE_URL}/account/orders`,
  };
}

/** Basic welcome email for newly registered customers. */
export function welcomeEmail(customerName: string) {
  const body = `
    <h2 style="margin:0 0 10px;font-size:18px;color:#1e293b;">Welcome to Dev Creation!</h2>
    <p style="margin:0 0 14px;font-size:14px;color:#475569;">
      Hi ${esc(customerName)}, thank you for creating an account with Dev Creation.
    </p>
    <p style="font-size:14px;color:#475569;line-height:1.6;">
      Explore our collection of handcrafted luxury scented candles, curated home aromas, and festive gifting essentials.
    </p>

    <div style="margin-top:18px;">
      ${button('Explore Candles', `${env.STORE_URL}/products`)}
    </div>`;

  return {
    subject: `Welcome to Dev Creation, ${customerName}!`,
    html: layout(body),
    text: `Hi ${customerName}, welcome to Dev Creation! Browse our handcrafted candles at ${env.STORE_URL}/products`,
  };
}

/** Basic password reset email. */
export function passwordResetEmail(customerName: string, resetUrl: string) {
  const body = `
    <h2 style="margin:0 0 10px;font-size:18px;color:#1e293b;">Reset Your Password</h2>
    <p style="margin:0 0 14px;font-size:14px;color:#475569;">
      Hi ${esc(customerName)}, we received a request to reset your password for your Dev Creation account. Click below to choose a new password:
    </p>

    <div style="margin:18px 0;">
      ${button('Reset Password', resetUrl)}
    </div>

    <p style="font-size:12px;color:#64748b;margin-top:16px;">
      This link is valid for 15 minutes. If you did not make this request, you can safely ignore this email.
    </p>`;

  return {
    subject: `Reset your Dev Creation password`,
    html: layout(body),
    text: `Hi ${customerName}, reset your Dev Creation password using this link (valid 15 mins): ${resetUrl}`,
  };
}

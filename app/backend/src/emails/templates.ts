import { env } from '@/config/env';
import type { IOrder, IOrderItem } from '@/models/Order';
import type { OrderStatus } from '@/constants';

/** Brand palette (kept in sync with the storefront design tokens). */
const C = {
  paper: '#FFFDF8',
  surface: '#FFFFFF',
  surface2: '#FAF6EF',
  ink: '#1C1410',
  ink3: '#5C4F46',
  gold: '#B8943F',
  goldDk: '#8C6F2A',
  deep: '#2C1810',
  line: '#EDE6DA',
};

const rupee = (n: number) => '&#8377;' + Math.round(n).toLocaleString('en-IN');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Shared responsive email shell with header + footer, all inline-styled. */
function layout(bodyHtml: string, preheader = ''): string {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.paper};font-family:Georgia,'Times New Roman',serif;color:${C.ink3};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:92%;background:${C.surface};border:1px solid ${C.line};border-radius:14px;overflow:hidden;">
        <!-- header -->
        <tr><td style="background:${C.deep};padding:26px 32px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:3px;color:#fff;font-weight:600;">DEV CREATION</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:4px;color:${C.gold};margin-top:6px;text-transform:uppercase;">Handcrafted with love, scented with care</div>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <!-- footer -->
        <tr><td style="background:${C.surface2};padding:22px 32px;border-top:1px solid ${C.line};text-align:center;">
          <div style="font-family:Arial,sans-serif;font-size:12px;color:${C.ink3};">Questions? Reply to this email or reach us on WhatsApp.</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:${C.goldDk};margin-top:8px;text-transform:uppercase;">Free shipping over &#8377;999 &middot; Returns within 14 days</div>
          <div style="font-family:Arial,sans-serif;font-size:11px;color:#9b8f84;margin-top:10px;">&copy; ${new Date().getFullYear()} Dev Creation</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.deep};color:#fff;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:13px 26px;border-radius:8px;">${esc(label)}</a>`;
}

function itemsTable(items: IOrderItem[]): string {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:Arial,sans-serif;font-size:13px;color:${C.ink};">
          ${esc(i.name)}${i.variantName ? ` <span style="color:${C.ink3};">(${esc(i.variantName)})</span>` : ''}
          <div style="color:${C.ink3};font-size:12px;">Qty ${i.quantity}</div>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-family:'Courier New',monospace;font-size:13px;color:${C.ink};white-space:nowrap;">${rupee(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`;
}

function totals(order: IOrder): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:3px 0;">Items total</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:13px;color:${C.ink};">${rupee(order.itemsTotal)}</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:3px 0;">Shipping</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:13px;color:${C.ink};">${order.shippingFee ? rupee(order.shippingFee) : 'Free'}</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:15px;color:${C.ink};font-weight:bold;padding-top:8px;border-top:1px solid ${C.line};">Total</td>
        <td align="right" style="font-family:'Courier New',monospace;font-size:15px;color:${C.ink};font-weight:bold;padding-top:8px;border-top:1px solid ${C.line};">${rupee(order.total)}</td></tr>
  </table>`;
}

function addressBlock(order: IOrder): string {
  const a = order.shippingAddress;
  return `<div style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};line-height:1.6;">
    <strong style="color:${C.ink};">${esc(a.fullName)}</strong><br>
    ${esc(a.line1)}${a.line2 ? ', ' + esc(a.line2) : ''}<br>
    ${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>
    ${esc(a.country)}<br>${esc(a.phone)}
  </div>`;
}

function sectionLabel(text: string): string {
  return `<div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.goldDk};margin:22px 0 8px;">${esc(text)}</div>`;
}

/** Customer order-confirmation email. */
export function orderConfirmationEmail(order: IOrder, customerName: string) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 6px;">Thank you for your order!</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 4px;">Hi ${esc(customerName)}, we've received your order and are getting it ready. Your invoice is attached.</p>
    <p style="font-family:'Courier New',monospace;font-size:13px;color:${C.gold};letter-spacing:1px;margin:14px 0;">Order ${esc(order.orderNumber)}</p>
    ${sectionLabel('Order summary')}
    ${itemsTable(order.items)}
    <div style="margin-top:12px;">${totals(order)}</div>
    ${sectionLabel('Shipping to')}
    ${addressBlock(order)}
    <div style="margin-top:26px;text-align:center;">${button('View your order', `${env.STORE_URL}/account/orders`)}</div>`;
  return {
    subject: `Order ${order.orderNumber} confirmed — Dev Creation`,
    html: layout(body, `Your Dev Creation order ${order.orderNumber} is confirmed.`),
    text: `Thank you for your order! Order ${order.orderNumber}. Total ${String(order.total)}. View: ${env.STORE_URL}/account/orders`,
  };
}

/** Admin new-order alert email. */
export function adminNewOrderEmail(order: IOrder, customerName: string) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 6px;">New order received</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0;">A new order has been placed and needs processing.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;background:${C.surface2};border-radius:10px;">
      <tr><td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};">
        <div><strong style="color:${C.ink};">Order:</strong> ${esc(order.orderNumber)}</div>
        <div><strong style="color:${C.ink};">Customer:</strong> ${esc(customerName)}</div>
        <div><strong style="color:${C.ink};">Total:</strong> ${rupee(order.total)}</div>
        <div><strong style="color:${C.ink};">Payment:</strong> ${esc(order.paymentMethod.toUpperCase())}</div>
      </td></tr>
    </table>
    ${sectionLabel('Items')}
    ${itemsTable(order.items)}
    ${sectionLabel('Ship to')}
    ${addressBlock(order)}
    <div style="margin-top:26px;text-align:center;">${button('Open in admin', `${env.STORE_URL.replace('3000', '3001')}/orders`)}</div>`;
  return {
    subject: `🛎 New order ${order.orderNumber} — ${rupee(order.total).replace('&#8377;', '₹')}`,
    html: layout(body, `New order ${order.orderNumber} from ${customerName}.`),
    text: `New order ${order.orderNumber} from ${customerName}. Total ${String(order.total)}.`,
  };
}

const STATUS_COPY: Record<OrderStatus, { title: string; line: string }> = {
  pending: { title: 'Order received', line: 'We have received your order and it is awaiting confirmation.' },
  confirmed: { title: 'Order confirmed', line: 'Good news — your order has been confirmed and will be prepared shortly.' },
  processing: { title: 'Order is being processed', line: 'We are carefully preparing and packing your items.' },
  shipped: { title: 'Your order has shipped', line: 'Your order is on its way! You will receive it soon.' },
  delivered: { title: 'Order delivered', line: 'Your order has been delivered. We hope you love it!' },
  cancelled: { title: 'Order cancelled', line: 'Your order has been cancelled. If this was a mistake, please contact us.' },
  refunded: { title: 'Order refunded', line: 'Your refund has been processed. It may take a few days to reflect.' },
};

/** Customer order status-update email. */
export function orderStatusEmail(order: IOrder, customerName: string, status: OrderStatus, note?: string) {
  const copy = STATUS_COPY[status];
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:25px;color:${C.ink};margin:0 0 6px;">${esc(copy.title)}</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 4px;">Hi ${esc(customerName)}, ${esc(copy.line)}</p>
    <p style="font-family:'Courier New',monospace;font-size:13px;color:${C.gold};letter-spacing:1px;margin:14px 0;">Order ${esc(order.orderNumber)} &middot; ${esc(status.toUpperCase())}</p>
    ${note ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};background:${C.surface2};border-radius:8px;padding:12px 14px;margin:0 0 8px;">${esc(note)}</p>` : ''}
    ${sectionLabel('Order summary')}
    ${itemsTable(order.items)}
    <div style="margin-top:12px;">${totals(order)}</div>
    <div style="margin-top:26px;text-align:center;">${button('Track your order', `${env.STORE_URL}/account/orders`)}</div>`;
  return {
    subject: `${copy.title} — Order ${order.orderNumber}`,
    html: layout(body, `${copy.title} for order ${order.orderNumber}.`),
    text: `${copy.title}. Order ${order.orderNumber} is now ${status}. ${note ?? ''}`,
  };
}

/** Welcome email for newly registered customers. */
export function welcomeEmail(customerName: string) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 6px;">Welcome to Dev Creation!</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 16px;line-height:1.6;">
      Dear ${esc(customerName)}, thank you for joining the Dev Creation family. We create luxury handcrafted scented candles, curated home aromas, and artisanal gifting essentials designed to elevate your everyday moments.
    </p>
    <div style="background:${C.surface2};border-radius:10px;padding:18px 22px;margin:20px 0;">
      <div style="font-family:Georgia,serif;font-size:15px;color:${C.ink};font-weight:600;margin-bottom:6px;">What you can enjoy with your account:</div>
      <ul style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding-left:20px;margin:0;line-height:1.7;">
        <li>Seamless order tracking & instant real-time updates</li>
        <li>Early access to limited editions & scented drops</li>
        <li>Express checkout and personalized recommendations</li>
      </ul>
    </div>
    <div style="margin-top:28px;text-align:center;">
      ${button('Explore Our Collections', `${env.STORE_URL}/products`)}
    </div>`;
  return {
    subject: `Welcome to Dev Creation, ${customerName} ✨`,
    html: layout(body, `Welcome to Dev Creation — Handcrafted with love, scented with care.`),
    text: `Welcome to Dev Creation, ${customerName}! Explore our handcrafted candles & aromas: ${env.STORE_URL}/products`,
  };
}

/** Password reset email. */
export function passwordResetEmail(customerName: string, resetUrl: string) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 6px;">Password Reset Request</h1>
    <p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};margin:0 0 14px;line-height:1.6;">
      Hi ${esc(customerName)}, we received a request to reset the password for your Dev Creation account. Click the button below to set a new password:
    </p>
    <div style="margin:26px 0;text-align:center;">
      ${button('Reset My Password', resetUrl)}
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#9b8f84;line-height:1.5;">
      This password reset link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
    </p>`;
  return {
    subject: `Reset your Dev Creation password`,
    html: layout(body, `Reset your Dev Creation password within 15 minutes.`),
    text: `Reset your Dev Creation password by opening: ${resetUrl} (Valid for 15 minutes).`,
  };
}

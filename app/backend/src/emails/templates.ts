import { env } from '@/config/env';
import type { IOrder, IOrderItem } from '@/models/Order';
import type { OrderStatus } from '@/constants';

const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Luxury Dev Creation email shell matching the storefront aesthetic. */
function layout(bodyHtml: string, previewText = ''): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Creation</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Georgia, 'Times New Roman', serif !important; }
  </style>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 20px 16px !important; }
      .header-padding { padding: 24px 16px !important; }
      .stack-column { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:24px 0;background-color:#FAF6F0;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1C1410;-webkit-font-smoothing:antialiased;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#FAF6F0;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${esc(previewText)}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:10px 14px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="container-table" style="width:600px;max-width:600px;background-color:#FFFFFF;border:1px solid #E5DCCB;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(44,24,16,0.06);">
          
          <!-- Luxury Brand Header -->
          <tr>
            <td class="header-padding" style="background-color:#2C1810;padding:32px 28px;text-align:center;border-bottom:3px solid #C5A059;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:4px;text-transform:uppercase;">
                      DEV CREATION
                    </div>
                    <div style="width:40px;height:1px;background-color:#C5A059;margin:8px auto;"></div>
                    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:10px;font-weight:600;color:#D4B06A;letter-spacing:2.5px;text-transform:uppercase;">
                      HANDCRAFTED WITH LOVE &bull; SCENTED WITH CARE
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content-padding" style="padding:36px 32px;background-color:#FFFFFF;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Artisanal Footer -->
          <tr>
            <td style="background-color:#F5EFE5;padding:26px 28px;border-top:1px solid #E5DCCB;text-align:center;">
              <div style="font-family:'Playfair Display',Georgia,serif;font-size:14px;font-style:italic;color:#5C4F46;margin-bottom:8px;">
                "Curating pure sensory warmth for your everyday sanctuary."
              </div>
              <div style="font-size:11px;color:#8C6F2A;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                100% Pure Soy Wax &bull; Toxin-Free &bull; Handcrafted in India
              </div>
              <div style="font-size:12px;color:#5C4F46;line-height:1.6;">
                Need help with your order? Contact our concierge:<br>
                <a href="mailto:support@devcreation24.in" style="color:#2C1810;font-weight:600;text-decoration:none;">support@devcreation24.in</a> &bull; 
                <a href="${env.STORE_URL}" style="color:#2C1810;font-weight:600;text-decoration:none;">devcreation24.in</a>
              </div>
              <div style="font-size:11px;color:#9b8f84;margin-top:14px;border-top:1px solid #E5DCCB;padding-top:12px;">
                &copy; ${new Date().getFullYear()} Dev Creation. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td align="center" style="background-color:#2C1810;border-radius:8px;border:1px solid #C5A059;">
        <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;">
          ${esc(label)} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

function itemsInvoiceTable(items: IOrderItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid #EFE8DC;">
        <td style="padding:14px 8px;vertical-align:middle;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:600;color:#1C1410;">
            ${esc(item.name)}
          </div>
          ${item.variantName ? `<div style="font-size:12px;color:#8C6F2A;margin-top:2px;">Variant: ${esc(item.variantName)}</div>` : ''}
          <div style="font-size:12px;color:#8A7A70;margin-top:2px;">SKU: ${esc(item.sku || 'DC-CANDLE')}</div>
        </td>
        <td align="center" style="padding:14px 8px;font-size:14px;color:#3D312A;vertical-align:middle;font-weight:500;">
          &times;${item.quantity}
        </td>
        <td align="right" style="padding:14px 8px;font-size:14px;color:#1C1410;vertical-align:middle;font-weight:600;white-space:nowrap;">
          ${rupee(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr style="background-color:#FBF7F0;border-top:1px solid #E5DCCB;border-bottom:1px solid #E5DCCB;">
        <th align="left" style="padding:10px 8px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1px;text-transform:uppercase;">Item Details</th>
        <th align="center" style="padding:10px 8px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1px;text-transform:uppercase;">Qty</th>
        <th align="right" style="padding:10px 8px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1px;text-transform:uppercase;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`;
}

/** Luxury Order Confirmation Email with Invoice Details */
export function orderConfirmationEmail(order: IOrder, customerName: string) {
  const a = order.shippingAddress;
  const isFreeShip = !order.shippingFee || order.shippingFee === 0;

  const body = `
    <!-- Top Greeting -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="display:inline-block;padding:4px 12px;background-color:#F5EFE5;border:1px solid #C5A059;border-radius:20px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
        Order Confirmed &bull; Invoice Generated
      </span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#2C1810;margin:0 0 8px;line-height:1.2;">
        Thank You For Your Order
      </h1>
      <p style="font-size:15px;color:#5C4F46;margin:0;line-height:1.5;">
        Dear <strong>${esc(customerName)}</strong>, we are thrilled to craft your luxury fragrance experience. Your order is confirmed and currently being prepared.
      </p>
    </div>

    <!-- Invoice Header Card -->
    <div style="background-color:#FBF7F0;border:1px solid #E5DCCB;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1px;text-transform:uppercase;">Invoice / Order No.</div>
            <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:#2C1810;margin-top:2px;">#${esc(order.orderNumber)}</div>
            <div style="font-size:12px;color:#8A7A70;margin-top:4px;">Date: ${new Date(order.placedAt || order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </td>
          <td align="right" style="vertical-align:top;">
            <div style="font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1px;text-transform:uppercase;">Payment Status</div>
            <div style="display:inline-block;padding:3px 10px;background-color:#EBF5EA;color:#276738;border-radius:4px;font-size:12px;font-weight:700;margin-top:4px;text-transform:uppercase;">
              ${esc(order.paymentStatus)}
            </div>
            <div style="font-size:12px;color:#8A7A70;margin-top:4px;text-transform:uppercase;">Method: ${esc(order.paymentMethod || 'COD')}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Ordered Items Section -->
    <div style="margin-bottom:24px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:18px;font-weight:600;color:#2C1810;border-bottom:2px solid #C5A059;padding-bottom:6px;">
        Order & Invoice Breakdown
      </div>
      ${itemsInvoiceTable(order.items)}
    </div>

    <!-- Invoice Totals Box -->
    <div style="background-color:#FBF7F0;border:1px solid #E5DCCB;border-radius:8px;padding:18px 20px;margin-bottom:26px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3D312A;">
        <tr>
          <td style="padding:4px 0;color:#5C4F46;">Items Subtotal</td>
          <td align="right" style="padding:4px 0;font-weight:600;">${rupee(order.itemsTotal || order.total)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#5C4F46;">Delivery & Handling</td>
          <td align="right" style="padding:4px 0;font-weight:600;color:${isFreeShip ? '#276738' : '#3D312A'};">
            ${isFreeShip ? 'FREE' : rupee(order.shippingFee)}
          </td>
        </tr>
        ${order.discount ? `
        <tr>
          <td style="padding:4px 0;color:#8C6F2A;">Special Promo Discount</td>
          <td align="right" style="padding:4px 0;font-weight:600;color:#8C6F2A;">- ${rupee(order.discount)}</td>
        </tr>` : ''}
        <tr>
          <td colspan="2" style="padding-top:10px;border-top:1px solid #E5DCCB;"></td>
        </tr>
        <tr style="font-size:18px;">
          <td style="font-family:'Playfair Display',Georgia,serif;font-weight:700;color:#2C1810;">Total Amount</td>
          <td align="right" style="font-family:'Playfair Display',Georgia,serif;font-weight:700;color:#8C6F2A;">
            ${rupee(order.total)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping & Delivery Address -->
    <div style="background-color:#FFFFFF;border:1px solid #E5DCCB;border-radius:8px;padding:18px 20px;margin-bottom:24px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:600;color:#2C1810;margin-bottom:10px;">
        📍 Shipping & Delivery Destination
      </div>
      <div style="font-size:13px;line-height:1.6;color:#5C4F46;">
        <strong style="color:#1C1410;font-size:14px;">${esc(a.fullName)}</strong><br>
        ${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ''}<br>
        ${esc(a.city)}, ${esc(a.state)} &mdash; <strong>${esc(a.postalCode)}</strong><br>
        Country: ${esc(a.country || 'India')}<br>
        <span style="color:#1C1410;">Phone: <strong>${esc(a.phone)}</strong></span>
      </div>
    </div>

    <!-- PDF Attachment Callout -->
    <div style="background-color:#F5EFE5;border:1px dashed #C5A059;border-radius:8px;padding:14px 18px;margin-bottom:20px;text-align:center;">
      <div style="font-size:13px;font-weight:600;color:#2C1810;">
        📎 Official Tax Invoice Attached
      </div>
      <div style="font-size:12px;color:#5C4F46;margin-top:2px;">
        A copy of your branded tax invoice (<span style="font-family:monospace;">invoice-${esc(order.orderNumber)}.pdf</span>) is attached with this email for your financial records.
      </div>
    </div>

    <!-- Action Button -->
    <div style="text-align:center;">
      ${button('Track Order & View Live Updates', `${env.STORE_URL}/account/orders`)}
    </div>
  `;

  return {
    subject: `Order Confirmed #${order.orderNumber} — Dev Creation Tax Invoice`,
    html: layout(body, `Your order #${order.orderNumber} is confirmed. View your receipt and order summary.`),
    text: `Thank you for your order! Order #${order.orderNumber} totaling Rs. ${order.total} has been confirmed. Track at: ${env.STORE_URL}/account/orders`,
  };
}

/** Luxury Admin New Order Notification */
export function adminNewOrderEmail(order: IOrder, customerName: string) {
  const a = order.shippingAddress;
  const body = `
    <div style="margin-bottom:20px;">
      <span style="display:inline-block;padding:3px 10px;background-color:#2C1810;color:#D4B06A;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
        Store Alert
      </span>
      <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#2C1810;margin:10px 0 6px;">
        New Order Received: #${esc(order.orderNumber)}
      </h2>
      <p style="font-size:14px;color:#5C4F46;margin:0;">
        A customer has placed an order on Dev Creation storefront.
      </p>
    </div>

    <div style="background-color:#FBF7F0;border:1px solid #E5DCCB;border-radius:8px;padding:16px 20px;margin-bottom:20px;font-size:13px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:#8C6F2A;font-weight:700;">Customer:</td><td align="right" style="font-weight:600;color:#1C1410;">${esc(customerName)}</td></tr>
        <tr><td style="padding:4px 0;color:#8C6F2A;font-weight:700;">Order Total:</td><td align="right" style="font-weight:700;color:#2C1810;font-size:16px;">${rupee(order.total)}</td></tr>
        <tr><td style="padding:4px 0;color:#8C6F2A;font-weight:700;">Payment Method:</td><td align="right" style="text-transform:uppercase;color:#1C1410;">${esc(order.paymentMethod)}</td></tr>
        <tr><td style="padding:4px 0;color:#8C6F2A;font-weight:700;">Phone:</td><td align="right" style="color:#1C1410;">${esc(a.phone)}</td></tr>
      </table>
    </div>

    ${itemsInvoiceTable(order.items)}

    <div style="margin-top:20px;">
      ${button('Open Order in Admin Panel', `https://login.devcreation24.in/orders`)}
    </div>
  `;

  return {
    subject: `🛎 [New Order] #${order.orderNumber} &bull; ${rupee(order.total)} from ${customerName}`,
    html: layout(body, `New order #${order.orderNumber} received for ${rupee(order.total)}.`),
    text: `New order #${order.orderNumber} placed by ${customerName} for Rs. ${order.total}. Manage: https://login.devcreation24.in/orders`,
  };
}

/** Luxury Order Status Update */
export function orderStatusEmail(order: IOrder, customerName: string, status: OrderStatus, note?: string) {
  const statusTitles: Record<string, string> = {
    confirmed: 'Your Order is Confirmed & Being Prepared',
    processing: 'Your Handcrafted Candles are in Packaging',
    shipped: 'Your Order Has Been Dispatched',
    delivered: 'Your Dev Creation Package Has Arrived',
    cancelled: 'Your Order Has Been Cancelled',
    refunded: 'Your Refund Has Been Processed',
  };

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;padding:4px 12px;background-color:#F5EFE5;border:1px solid #C5A059;border-radius:20px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">
        Order Status Update
      </span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:#2C1810;margin:0 0 6px;">
        ${esc(statusTitles[status] || `Order ${status.toUpperCase()}`)}
      </h1>
      <p style="font-size:15px;color:#5C4F46;margin:0;">
        Hi ${esc(customerName)}, here is the latest update on your order <strong>#${esc(order.orderNumber)}</strong>.
      </p>
    </div>

    ${note ? `
    <div style="background-color:#FAF6EF;border-left:4px solid #C5A059;padding:12px 16px;border-radius:4px;margin-bottom:20px;font-size:13px;color:#3D312A;">
      <strong>Note from Concierge:</strong> ${esc(note)}
    </div>` : ''}

    <div style="margin-bottom:24px;">
      ${itemsInvoiceTable(order.items)}
    </div>

    <div style="text-align:center;">
      ${button('Track Live Shipment', `${env.STORE_URL}/account/orders`)}
    </div>
  `;

  return {
    subject: `Order Update #${order.orderNumber}: ${status.toUpperCase()} — Dev Creation`,
    html: layout(body, `Your order #${order.orderNumber} is now ${status}.`),
    text: `Order #${order.orderNumber} status update: ${status}. View details at ${env.STORE_URL}/account/orders`,
  };
}

/** Luxury Welcome Email */
export function welcomeEmail(customerName: string) {
  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <span style="display:inline-block;padding:4px 12px;background-color:#F5EFE5;border:1px solid #C5A059;border-radius:20px;font-size:11px;font-weight:700;color:#8C6F2A;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">
        Artisanal Luxury
      </span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;color:#2C1810;margin:0 0 8px;">
        Welcome to the Family
      </h1>
      <p style="font-size:15px;color:#5C4F46;line-height:1.6;margin:0;">
        Dear <strong>${esc(customerName)}</strong>, welcome to Dev Creation. We design soulful, handcrafted scented candles and curated home fragrances to transform your living spaces into serene havens.
      </p>
    </div>

    <div style="background-color:#FBF7F0;border:1px solid #E5DCCB;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:600;color:#2C1810;margin-bottom:10px;">
        What Awaits You:
      </div>
      <ul style="font-size:13px;color:#5C4F46;line-height:1.8;padding-left:18px;margin:0;">
        <li>Exclusive access to limited-edition candle drops</li>
        <li>Priority express dispatch on all bespoke orders</li>
        <li>Special festive & anniversary gifting privilege</li>
      </ul>
    </div>

    <div style="text-align:center;">
      ${button('Explore Our Candles Collection', `${env.STORE_URL}/products`)}
    </div>
  `;

  return {
    subject: `Welcome to Dev Creation, ${customerName} ✨`,
    html: layout(body, `Welcome to Dev Creation handcrafted luxury candles.`),
    text: `Welcome to Dev Creation, ${customerName}! Explore our luxury candles at ${env.STORE_URL}/products`,
  };
}

/** Luxury Password Reset Email */
export function passwordResetEmail(customerName: string, resetUrl: string) {
  const body = `
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:#2C1810;margin:0 0 8px;">
        Password Reset Request
      </h1>
      <p style="font-size:14px;color:#5C4F46;margin:0;">
        Hi ${esc(customerName)}, we received a request to reset the password for your Dev Creation account.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      ${button('Reset My Password', resetUrl)}
    </div>

    <p style="font-size:12px;color:#8A7A70;text-align:center;margin-top:20px;line-height:1.5;">
      This security link will expire in <strong>15 minutes</strong>.<br>
      If you did not initiate this request, you can safely disregard this message.
    </p>
  `;

  return {
    subject: `Reset Your Dev Creation Password`,
    html: layout(body, `Security link to reset your Dev Creation account password.`),
    text: `Reset your Dev Creation password using this link (valid 15 mins): ${resetUrl}`,
  };
}

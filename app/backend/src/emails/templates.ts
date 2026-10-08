import { env } from '@/config/env';
import type { IOrder, IOrderItem } from '@/models/Order';
import type { OrderStatus } from '@/constants';

const rupee = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/** Website color tokens matching tailwind.config.ts and globals.css */
const C = {
  paper: '#FFFDF8',
  surface: '#FFFFFF',
  surface2: '#FAF6EF',
  surface3: '#F0EAE0',
  ink: '#1C1410',
  ink2: '#3D312A',
  ink3: '#5C4F46',
  gold: '#B8943F',
  goldDk: '#8C6F2A',
  goldLt: '#D4B06A',
  copper: '#C17F3E',
  forest: '#8B5E3C',
  deep: '#2C1810',
  line: '#E5DCCB',
  lineSoft: '#F6F1EA',
};

function resolveItemImg(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return `${env.STORE_URL}/assets/Logos/logo.jpeg`;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/assets/')) return `${env.STORE_URL}${trimmed}`;
  if (trimmed.startsWith('assets/')) return `${env.STORE_URL}/${trimmed}`;
  if (trimmed.startsWith('/uploads/')) return `${env.PUBLIC_ASSET_BASE}${trimmed}`;
  if (trimmed.startsWith('uploads/')) return `${env.PUBLIC_ASSET_BASE}/${trimmed}`;
  return `${env.STORE_URL}/assets/Logos/logo.jpeg`;
}

/** Shared responsive email shell matching the website styling and fonts */
function layout(bodyHtml: string, previewText = ''): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Creation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
    .font-serif { font-family: 'Playfair Display', Georgia, serif !important; }
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif !important; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
    @media only screen and (max-width: 600px) {
      .shell-table { width: 100% !important; border-radius: 0 !important; }
      .p-card { padding: 20px 16px !important; }
      .timeline-step { padding: 0 4px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:24px 0;background-color:${C.paper};font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;">
  ${previewText ? `<div style="display:none;font-size:1px;color:${C.paper};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${esc(previewText)}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.paper};margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:8px 12px;">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" class="shell-table" style="width:620px;max-width:620px;background-color:${C.surface};border:1px solid ${C.line};border-radius:12px;overflow:hidden;box-shadow:0 14px 34px -12px rgba(28,20,16,.15);">
          
          <!-- Website-Matched Brand Header -->
          <tr>
            <td style="background-color:${C.deep};padding:28px 20px 22px;text-align:center;border-bottom:3px solid ${C.gold};">
              <a href="${env.STORE_URL}" target="_blank" style="text-decoration:none;display:block;">
                <img src="${env.STORE_URL}/assets/Logos/logo.jpeg" alt="Dev Creation" width="68" height="68" style="width:68px;height:68px;border-radius:50%;border:2px solid ${C.gold};display:block;margin:0 auto 10px;box-shadow:0 4px 14px rgba(0,0,0,0.35);object-fit:cover;" />
                <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:4px;text-transform:uppercase;">
                  DEV CREATION
                </div>
                <div style="width:36px;height:1px;background-color:${C.gold};margin:8px auto;"></div>
                <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;font-weight:600;color:${C.goldLt};letter-spacing:2px;text-transform:uppercase;">
                  HANDCRAFTED WITH LOVE &bull; SCENTED WITH CARE
                </div>
              </a>
              <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.12);font-family:'JetBrains Mono',ui-monospace,monospace;">
                <a href="${env.STORE_URL}/products" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Collection</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/our-story" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Our Story</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/categories/gift-sets" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Gifting</a>
                <span style="color:${C.gold};font-size:9px;">&bull;</span>
                <a href="${env.STORE_URL}/#care" target="_blank" style="color:#FAF6EF;text-decoration:none;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin:0 8px;">Care</a>
              </div>
            </td>
          </tr>

          <!-- Email Content -->
          <tr>
            <td class="p-card" style="padding:32px 28px;background-color:${C.surface};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Storefront-Matching Footer -->
          <tr>
            <td style="background-color:${C.surface2};padding:26px 20px;border-top:1px solid ${C.line};text-align:center;">
              <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-style:italic;color:${C.ink2};margin-bottom:6px;">
                "Handcrafted with love, Scented with care."
              </div>
              <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;color:${C.copper};font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                100% Pure Soy Wax &bull; Hand-Poured in India &bull; Master Perfumer Oils
              </div>
              <div style="font-size:12px;color:${C.ink3};line-height:1.7;">
                Concierge: <a href="mailto:support@devcreation24.in" style="color:${C.ink};font-weight:600;text-decoration:none;">support@devcreation24.in</a> &bull; Phone: <strong style="color:${C.ink};">+91 788 758 2008</strong><br>
                Online Boutique: <a href="${env.STORE_URL}" style="color:${C.ink};font-weight:600;text-decoration:none;">devcreation24.in</a>
              </div>
              <div style="font-size:11px;color:#9b8f84;margin-top:14px;border-top:1px solid ${C.line};padding-top:10px;">
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

/** Badges matching OrderStatusBadge.tsx */
function statusBadge(status: string): string {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    confirmed: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    processing: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
    shipped: { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC' },
    delivered: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    cancelled: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
    refunded: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  };
  const s = map[status.toLowerCase()] || map.pending;
  return `<span style="display:inline-block;border-radius:9999px;border:1px solid ${s.border};background-color:${s.bg};color:${s.text};padding:4px 10px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;">${esc(status)}</span>`;
}

/** Badges matching PaymentStatusBadge.tsx */
function paymentBadge(status: string): string {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    paid: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    failed: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
    refunded: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  };
  const s = map[status.toLowerCase()] || map.pending;
  return `<span style="display:inline-block;border-radius:9999px;border:1px solid ${s.border};background-color:${s.bg};color:${s.text};padding:4px 10px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;">${esc(status)}</span>`;
}

/** 5-Step visual timeline matching website order detail */
function renderTimeline(currentStatus: string): string {
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const labels = ['Placed', 'Confirmed', 'Packing', 'Shipped', 'Delivered'];
  const currentIdx = steps.indexOf(currentStatus.toLowerCase());

  const items = steps
    .map((_step, idx) => {
      const isPastOrCurrent = currentIdx >= idx;
      const circleBg = isPastOrCurrent ? C.gold : C.surface3;
      const circleColor = isPastOrCurrent ? '#FFFFFF' : C.ink3;
      const labelColor = isPastOrCurrent ? C.ink : '#9b8f84';

      return `
      <td align="center" class="timeline-step" style="width:20%;vertical-align:top;">
        <div style="width:28px;height:28px;border-radius:50%;background-color:${circleBg};color:${circleColor};line-height:28px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:700;margin:0 auto;text-align:center;">
          ${idx + 1}
        </div>
        <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${labelColor};margin-top:6px;">
          ${labels[idx]}
        </div>
      </td>`;
    })
    .join('');

  return `
  <div style="margin:22px 0;background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:16px 10px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>${items}</tr>
    </table>
  </div>`;
}

function button(label: string, href: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td align="center" style="background-color:${C.deep};border-radius:10px;border:1.5px solid ${C.deep};box-shadow:0 8px 25px rgba(44,24,16,0.18);">
        <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.18em;text-transform:uppercase;">
          ${esc(label)} &rarr;
        </a>
      </td>
    </tr>
  </table>`;
}

/** Product items table matching OrderDetailClient.tsx card */
function renderItemsCard(items: IOrderItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr style="border-bottom:1px solid ${C.lineSoft};">
        <td style="padding:14px 6px;vertical-align:middle;width:52px;">
          <div style="width:50px;height:50px;background-color:${C.surface2};border:1px solid ${C.line};border-radius:8px;overflow:hidden;text-align:center;">
            <img src="${resolveItemImg(item.image)}" alt="${esc(item.name)}" width="50" height="50" style="width:50px;height:50px;object-fit:cover;display:block;" />
          </div>
        </td>
        <td style="padding:14px 10px;vertical-align:middle;">
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-weight:600;color:${C.ink};line-height:1.2;">
            ${esc(item.name)}
          </div>
          <div style="font-size:12px;color:${C.ink3};margin-top:2px;">
            ${item.variantName ? `${esc(item.variantName)} &middot; ` : ''}Qty ${item.quantity}
          </div>
        </td>
        <td align="right" style="padding:14px 6px;vertical-align:middle;font-size:14px;font-weight:600;color:${C.ink};white-space:nowrap;font-variant-numeric:tabular-nums;">
          ${rupee(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('');

  return `
  <div style="background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:18px 20px;margin-bottom:20px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
      ITEMS
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
    </table>
  </div>`;
}

/** Customer order-confirmation email matching storefront order detail */
export function orderConfirmationEmail(order: IOrder, customerName: string) {
  const a = order.shippingAddress;
  const isFreeShip = !order.shippingFee || order.shippingFee === 0;
  const formattedDate = new Date(order.placedAt || order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const body = `
    <!-- Order Number & Top Badges (Mirroring Storefront Header) -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="vertical-align:top;">
          <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;color:${C.ink};margin:0;letter-spacing:0.5px;">
            ${esc(order.orderNumber)}
          </h1>
          <div style="font-size:12px;color:${C.ink3};margin-top:3px;">
            Thank you, <strong style="color:${C.ink};">${esc(customerName)}</strong> &bull; Placed ${formattedDate}
          </div>
        </td>
        <td align="right" style="vertical-align:top;">
          <div style="margin-bottom:4px;">${statusBadge(order.status)}</div>
          <div>${paymentBadge(order.paymentStatus)}</div>
        </td>
      </tr>
    </table>

    <!-- 5-Step Timeline Bar -->
    ${renderTimeline(order.status)}

    <!-- Main Grid: Items Card & Financials -->
    ${renderItemsCard(order.items)}

    <!-- Order Financials Card -->
    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:${C.ink2};">
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.ink3};">Items total</td>
          <td align="right" style="padding:4px 0;font-weight:500;">${rupee(order.itemsTotal || order.total)}</td>
        </tr>
        ${order.discount ? `
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#15803D;">Discount ${order.promoCode ? `(${esc(order.promoCode)})` : ''}</td>
          <td align="right" style="padding:4px 0;font-weight:600;color:#15803D;">-${rupee(order.discount)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:4px 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.ink3};">Shipping</td>
          <td align="right" style="padding:4px 0;font-weight:500;color:${isFreeShip ? '#15803D' : C.ink2};">
            ${isFreeShip ? 'Free' : rupee(order.shippingFee)}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:10px;border-top:1px solid ${C.line};"></td>
        </tr>
        <tr style="font-size:16px;font-weight:700;">
          <td style="font-family:'Playfair Display',Georgia,serif;color:${C.ink};">Total Amount</td>
          <td align="right" style="font-family:'Playfair Display',Georgia,serif;color:${C.goldDk};">
            ${rupee(order.total)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping To Card (Matching Storefront Aside) -->
    <div style="background-color:${C.surface};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
        SHIPPING TO
      </div>
      <div style="font-size:13px;line-height:1.6;color:${C.ink2};">
        <strong style="color:${C.ink};">${esc(a.fullName)}</strong><br>
        ${esc(a.line1)}${a.line2 ? `, ${esc(a.line2)}` : ''}<br>
        ${esc(a.city)}, ${esc(a.state)} ${esc(a.postalCode)}<br>
        ${esc(a.country || 'India')}<br>
        Phone: ${esc(a.phone)}
      </div>
    </div>

    <!-- Official PDF Tax Invoice Attachment Box -->
    <div style="background-color:${C.paper};border:1px dashed ${C.gold};border-radius:10px;padding:14px 18px;margin-bottom:22px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:${C.ink};">
        📎 Official Tax Invoice Attached (PDF)
      </div>
      <div style="font-size:12px;color:${C.ink3};margin-top:3px;">
        A copy of your branded tax invoice (<span style="font-family:'JetBrains Mono',monospace;font-weight:600;">invoice-${esc(order.orderNumber)}.pdf</span>) has been generated and attached for your records.
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;">
      ${button('View Order on Website', `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;

  return {
    subject: `Order #${order.orderNumber} Confirmed — Dev Creation Tax Invoice`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is confirmed. View details and invoice.`),
    text: `Order #${order.orderNumber} confirmed! Total: Rs. ${order.total}. View details: ${env.STORE_URL}/account/orders/${order._id}`,
  };
}

/** Admin notification email matching storefront */
export function adminNewOrderEmail(order: IOrder, customerName: string) {
  const a = order.shippingAddress;
  const body = `
    <div style="margin-bottom:16px;">
      <span style="display:inline-block;padding:3px 10px;background-color:${C.deep};color:${C.goldLt};border-radius:12px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
        Store Alert
      </span>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:${C.ink};margin:8px 0 4px;">
        New Order: #${esc(order.orderNumber)}
      </h1>
      <p style="font-size:13px;color:${C.ink3};margin:0;">
        Placed by ${esc(customerName)} on Dev Creation.
      </p>
    </div>

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin-bottom:20px;font-size:13px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Customer:</td><td align="right" style="font-weight:600;color:${C.ink};">${esc(customerName)}</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Total Amount:</td><td align="right" style="font-weight:700;color:${C.deep};font-size:16px;">${rupee(order.total)}</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Payment:</td><td align="right" style="text-transform:uppercase;">${esc(order.paymentMethod)} (${esc(order.paymentStatus)})</td></tr>
        <tr><td style="padding:4px 0;color:${C.goldDk};font-weight:700;">Phone:</td><td align="right">${esc(a.phone)}</td></tr>
      </table>
    </div>

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:20px;">
      ${button('Open in Admin Panel', `https://login.devcreation24.in/orders`)}
    </div>
  `;

  return {
    subject: `🛎 [New Order] #${order.orderNumber} — ${rupee(order.total)} from ${customerName}`,
    html: layout(body, `New order #${order.orderNumber} received.`),
    text: `New order #${order.orderNumber} placed by ${customerName} for Rs. ${order.total}. Manage: https://login.devcreation24.in/orders`,
  };
}

/** Extracts courier name and tracking code from note if present */
function parseTrackingFromNote(note?: string): { carrier?: string; trackingNumber?: string; trackingUrl?: string } {
  if (!note) return {};
  const cleaned = note.trim();
  
  // Extract URL if present
  const urlMatch = cleaned.match(/(https?:\/\/[^\s]+)/i);
  const trackingUrl = urlMatch ? urlMatch[1] : undefined;

  // Extract carrier and tracking code
  let carrier: string | undefined;
  let trackingNumber: string | undefined;

  const carriers = ['BlueDart', 'Delhivery', 'DTDC', 'India Post', 'Ekart', 'Xpressbees', 'Shadowfax', 'Shiprocket', 'FedEx', 'DHL'];
  for (const c of carriers) {
    if (new RegExp(`\\b${c}\\b`, 'i').test(cleaned)) {
      carrier = c;
      break;
    }
  }

  // Look for AWB / Tracking: XXXXXX
  const codeMatch = cleaned.match(/(?:AWB|Tracking|Tracking Number|Track ID|Docket|Ref)[:\s#]+([A-Z0-9_-]{6,30})/i);
  if (codeMatch) {
    trackingNumber = codeMatch[1];
  } else if (!trackingUrl) {
    // If note is a standalone alphanumeric tracking code
    const standaloneMatch = cleaned.match(/\b([A-Z0-9]{8,24})\b/i);
    if (standaloneMatch && !carrier) {
      trackingNumber = standaloneMatch[1];
    }
  }

  return { carrier, trackingNumber, trackingUrl };
}

/** Stage 2: Confirmed Email */
export function orderConfirmedEmail(order: IOrder, customerName: string, note?: string) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 2 OF 5 &bull; ORDER CONFIRMED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Order #${esc(order.orderNumber)} Confirmed
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, thank you for choosing Dev Creation. Our master artisans have confirmed your order and are preparing your selected artisanal wax sachets.
      </p>
    </div>

    ${renderTimeline('confirmed')}

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Note from Concierge:</strong> ${esc(note)}
    </div>` : ''}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button('View Order Status', `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;

  return {
    subject: `✨ Order #${order.orderNumber} Confirmed — Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is confirmed and being prepared.`),
    text: `Your Dev Creation order #${order.orderNumber} is confirmed! View status: ${env.STORE_URL}/account/orders/${order._id}`,
  };
}

/** Stage 3: Packing Email (Processing) */
export function orderPackingEmail(order: IOrder, customerName: string, note?: string) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 3 OF 5 &bull; PACKING WITH CARE
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Is Being Packed
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your handcrafted pieces are receiving their finishing touches. Each wax sachet is lovingly inspected, scented with care, and cushioned in eco-conscious packaging.
      </p>
    </div>

    ${renderTimeline('processing')}

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:16px 20px;margin:20px 0;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        ARTISANAL PACKAGING PROMISE
      </div>
      <div style="font-size:13px;color:${C.ink2};line-height:1.6;">
        &bull; 100% Biodegradable protective honeycomb wrap<br>
        &bull; Signature gold-embossed fragrance seal<br>
        &bull; Fragrance notes care card included with every box
      </div>
    </div>

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Note from Studio:</strong> ${esc(note)}
    </div>` : ''}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button('Track Fulfillment', `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;

  return {
    subject: `📦 Packing With Care: Order #${order.orderNumber} — Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} is now being packed with care.`),
    text: `Your Dev Creation order #${order.orderNumber} is being packed with care! View: ${env.STORE_URL}/account/orders/${order._id}`,
  };
}

/** Stage 4: Shipped Email with Tracking */
export function orderShippedEmail(order: IOrder, customerName: string, note?: string) {
  const tracking = parseTrackingFromNote(note);
  const a = order.shippingAddress;
  const trackHref = tracking.trackingUrl || `${env.STORE_URL}/account/orders/${order._id}`;

  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        STAGE 4 OF 5 &bull; DISPATCHED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Has Shipped! 🚚
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Great news, ${esc(customerName)}! Your parcel has been securely handed to our courier partner and is on its journey to you.
      </p>
    </div>

    ${renderTimeline('shipped')}

    <!-- Logistics & Tracking Card -->
    <div style="background-color:${C.surface2};border:1.5px solid ${C.gold};border-radius:12px;padding:20px;margin:22px 0;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:10px;">
        LOGISTICS &amp; TRACKING DETAILS
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:${C.ink};">
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">Courier Partner:</td>
          <td align="right" style="padding:6px 0;font-weight:700;color:${C.deep};">
            ${esc(tracking.carrier || 'Express Courier Partner')}
          </td>
        </tr>
        ${tracking.trackingNumber ? `
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">AWB / Tracking No:</td>
          <td align="right" style="padding:6px 0;font-family:'JetBrains Mono',monospace;font-weight:700;color:${C.goldDk};font-size:14px;">
            ${esc(tracking.trackingNumber)}
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:6px 0;color:${C.ink3};">Delivering To:</td>
          <td align="right" style="padding:6px 0;font-weight:500;">
            ${esc(a.city)}, ${esc(a.state)} (${esc(a.postalCode)})
          </td>
        </tr>
      </table>

      ${note && !tracking.trackingNumber ? `
      <div style="margin-top:12px;padding-top:10px;border-top:1px dashed ${C.line};font-size:12px;color:${C.ink2};">
        <strong>Dispatch Note:</strong> ${esc(note)}
      </div>` : ''}
    </div>

    <div style="text-align:center;margin:16px 0 24px;">
      ${button('Track Your Parcel', trackHref)}
    </div>

    ${renderItemsCard(order.items)}
  `;

  return {
    subject: `🚚 On Its Way! Order #${order.orderNumber} Has Shipped — Dev Creation`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} has shipped. Track your parcel now.`),
    text: `Your Dev Creation order #${order.orderNumber} has shipped! Track delivery: ${trackHref}`,
  };
}

/** Stage 5: Delivered Email */
export function orderDeliveredEmail(order: IOrder, customerName: string, note?: string) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:6px;">
        FINAL STAGE &bull; COMPLETED
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Your Order Has Arrived! 🎉
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your Dev Creation package has been delivered. We hope your new fragrances bring exquisite aroma and serenity to your sanctuary.
      </p>
    </div>

    ${renderTimeline('delivered')}

    <!-- Wax Sachet & Fragrance Care Tips Card -->
    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:12px;padding:20px;margin:22px 0;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:600;color:${C.ink};margin-bottom:8px;">
        ✨ How to Enjoy Your Artisanal Wax Sachets:
      </div>
      <div style="font-size:13px;color:${C.ink2};line-height:1.8;">
        &bull; <strong>Ideal Placement:</strong> Hang or place in your wardrobe, linen closet, or entryway.<br>
        &bull; <strong>Keep Cool:</strong> Keep away from direct sunlight or open heat sources.<br>
        &bull; <strong>Aroma Refresh:</strong> After a few months, gently scrape the wax edge to release a fresh burst of perfumed oils.
      </div>
    </div>

    ${note ? `
    <div style="background-color:${C.surface2};border-left:4px solid ${C.gold};padding:14px 18px;border-radius:6px;margin:20px 0;font-size:13px;color:${C.ink2};">
      <strong style="color:${C.ink};">Delivery Note:</strong> ${esc(note)}
    </div>` : ''}

    ${renderItemsCard(order.items)}

    <div style="text-align:center;margin-top:24px;">
      ${button('Leave a Review & View Order', `${env.STORE_URL}/account/orders/${order._id}`)}
    </div>
  `;

  return {
    subject: `🎉 Delivered: Order #${order.orderNumber} — Enjoy Your Fragrance!`,
    html: layout(body, `Your Dev Creation order #${order.orderNumber} has arrived. Enjoy your artisanal fragrance!`),
    text: `Your Dev Creation order #${order.orderNumber} has arrived! Thank you for choosing Dev Creation: ${env.STORE_URL}/account/orders/${order._id}`,
  };
}

/** Cancelled Email */
export function orderCancelledEmail(order: IOrder, customerName: string, note?: string) {
  const body = `
    <div style="margin-bottom:20px;text-align:center;">
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#B91C1C;margin:0 0 8px;">
        Order #${esc(order.orderNumber)} Cancelled
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0 auto;max-width:480px;">
        Dear ${esc(customerName)}, your order #${esc(order.orderNumber)} has been cancelled.
      </p>
    </div>

    ${note ? `
    <div style="background-color:#FEF2F2;border:1px solid #FECACA;padding:14px 18px;border-radius:8px;margin:20px 0;font-size:13px;color:#991B1B;">
      <strong>Reason / Note:</strong> ${esc(note)}
    </div>` : ''}

    <p style="font-size:13px;color:${C.ink2};line-height:1.6;text-align:center;">
      If you already completed an online payment, a full refund has been initiated to your original payment method within 5–7 business days.
    </p>

    <div style="text-align:center;margin-top:24px;">
      ${button('Browse Collection', `${env.STORE_URL}/products`)}
    </div>
  `;

  return {
    subject: `Order #${order.orderNumber} Cancelled — Dev Creation`,
    html: layout(body, `Your order #${order.orderNumber} has been cancelled.`),
    text: `Your Dev Creation order #${order.orderNumber} has been cancelled. Details: ${env.STORE_URL}/account/orders/${order._id}`,
  };
}

/** Unified status email dispatcher routing to the bespoke stage template */
export function orderStatusEmail(order: IOrder, customerName: string, status: OrderStatus, note?: string) {
  switch (status) {
    case 'confirmed':
      return orderConfirmedEmail(order, customerName, note);
    case 'processing':
      return orderPackingEmail(order, customerName, note);
    case 'shipped':
      return orderShippedEmail(order, customerName, note);
    case 'delivered':
      return orderDeliveredEmail(order, customerName, note);
    case 'cancelled':
      return orderCancelledEmail(order, customerName, note);
    default:
      return orderConfirmedEmail(order, customerName, note);
  }
}

/** Welcome email matching storefront aesthetics */
export function welcomeEmail(customerName: string) {
  const body = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.copper};margin-bottom:8px;">
        WELCOME
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;color:${C.ink};margin:0 0 8px;">
        Welcome to Dev Creation, ${esc(customerName)}
      </h1>
      <p style="font-size:14px;color:${C.ink3};line-height:1.6;margin:0;">
        Thank you for joining our community. Discover our luxury handcrafted candles and signature fragrances.
      </p>
    </div>

    <div style="background-color:${C.surface2};border:1px solid ${C.line};border-radius:10px;padding:18px 22px;margin:20px 0;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:15px;font-weight:600;color:${C.ink};margin-bottom:8px;">
        Your Membership Benefits:
      </div>
      <ul style="font-size:13px;color:${C.ink3};line-height:1.8;padding-left:18px;margin:0;">
        <li>Real-time order tracking and invoice management</li>
        <li>Early access to seasonal candle releases</li>
        <li>Priority concierge gifting support</li>
      </ul>
    </div>

    <div style="text-align:center;">
      ${button('Explore Our Candles', `${env.STORE_URL}/products`)}
    </div>
  `;

  return {
    subject: `Welcome to Dev Creation, ${customerName} ✨`,
    html: layout(body, `Welcome to Dev Creation handcrafted luxury candles.`),
    text: `Welcome to Dev Creation, ${customerName}! Explore: ${env.STORE_URL}/products`,
  };
}

/** Password reset email */
export function passwordResetEmail(customerName: string, resetUrl: string) {
  const body = `
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:${C.ink};margin:0 0 8px;">
        Password Reset
      </h1>
      <p style="font-size:14px;color:${C.ink3};margin:0;">
        Hi ${esc(customerName)}, click the button below to reset your Dev Creation password:
      </p>
    </div>

    <div style="text-align:center;margin:24px 0;">
      ${button('Reset Password', resetUrl)}
    </div>

    <p style="font-size:12px;color:#8A7A70;text-align:center;margin-top:20px;">
      This link will expire in <strong>15 minutes</strong>. If you did not make this request, you can ignore this email.
    </p>
  `;

  return {
    subject: `Reset Your Dev Creation Password`,
    html: layout(body, `Security link to reset your password.`),
    text: `Reset password: ${resetUrl} (Valid for 15 mins)`,
  };
}

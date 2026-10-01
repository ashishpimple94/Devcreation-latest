import PDFDocument from 'pdfkit';
import type { IOrder } from '@/models/Order';

const GOLD = '#B8943F';
const DEEP = '#2C1810';
const INK = '#1C1410';
const INK3 = '#5C4F46';
const LINE = '#E5DCCB';

const rupee = (n: number) => 'Rs. ' + Math.round(n).toLocaleString('en-IN');

/**
 * Generates a branded PDF invoice for an order and resolves to a Buffer that can
 * be attached to an email. Uses pdfkit's built-in fonts (no external assets).
 */
export function generateInvoicePdf(order: IOrder, customerName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const left = 50;
      const right = pageWidth - 50;

      // Header band
      doc.rect(0, 0, pageWidth, 90).fill(DEEP);
      doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('DEV CREATION', left, 30);
      doc.fillColor(GOLD).fontSize(8).font('Helvetica').text('HANDCRAFTED WITH LOVE, SCENTED WITH CARE', left, 58, { characterSpacing: 2 });
      doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('INVOICE', left, 30, { align: 'right', width: right - left });

      // Meta
      let y = 115;
      doc.fillColor(INK).fontSize(11).font('Helvetica-Bold').text(`Invoice: ${order.orderNumber}`, left, y);
      doc.fillColor(INK3).font('Helvetica').fontSize(10);
      doc.text(`Date: ${new Date(order.placedAt ?? order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, left, (y += 16));
      doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})`, left, (y += 14));
      doc.text(`Status: ${order.status}`, left, (y += 14));

      // Bill / ship to
      const a = order.shippingAddress;
      const boxY = 115;
      doc.fillColor(GOLD).fontSize(8).font('Helvetica-Bold').text('BILL / SHIP TO', right - 220, boxY, { width: 220, align: 'right', characterSpacing: 1 });
      doc.fillColor(INK).fontSize(10).font('Helvetica-Bold').text(customerName || a.fullName, right - 220, boxY + 14, { width: 220, align: 'right' });
      doc.fillColor(INK3).font('Helvetica').fontSize(9);
      doc.text(
        `${a.line1}${a.line2 ? ', ' + a.line2 : ''}\n${a.city}, ${a.state} ${a.postalCode}\n${a.country}\n${a.phone}`,
        right - 220,
        boxY + 30,
        { width: 220, align: 'right' },
      );

      // Table header
      y = 210;
      doc.rect(left, y, right - left, 24).fill('#FAF6EF');
      doc.fillColor(INK3).fontSize(9).font('Helvetica-Bold');
      doc.text('ITEM', left + 10, y + 8);
      doc.text('QTY', left + 300, y + 8, { width: 40, align: 'right' });
      doc.text('PRICE', left + 350, y + 8, { width: 70, align: 'right' });
      doc.text('AMOUNT', right - 90, y + 8, { width: 80, align: 'right' });
      y += 24;

      // Rows
      doc.font('Helvetica').fontSize(10);
      for (const item of order.items) {
        const name = item.variantName ? `${item.name} (${item.variantName})` : item.name;
        doc.fillColor(INK).text(name, left + 10, y + 8, { width: 280 });
        doc.fillColor(INK3).text(String(item.quantity), left + 300, y + 8, { width: 40, align: 'right' });
        doc.text(rupee(item.price), left + 350, y + 8, { width: 70, align: 'right' });
        doc.fillColor(INK).text(rupee(item.price * item.quantity), right - 90, y + 8, { width: 80, align: 'right' });
        const rowH = Math.max(doc.heightOfString(name, { width: 280 }) + 12, 26);
        y += rowH;
        doc.moveTo(left, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.5).stroke();
      }

      // Totals
      y += 12;
      const totalsX = right - 220;
      const totalRow = (label: string, value: string, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10).fillColor(bold ? INK : INK3);
        doc.text(label, totalsX, y, { width: 120 });
        doc.fillColor(INK).text(value, right - 90, y, { width: 80, align: 'right' });
        y += bold ? 22 : 16;
      };
      totalRow('Items total', rupee(order.itemsTotal));
      totalRow('Shipping', order.shippingFee ? rupee(order.shippingFee) : 'Free');
      doc.moveTo(totalsX, y).lineTo(right, y).strokeColor(LINE).lineWidth(0.5).stroke();
      y += 8;
      totalRow('TOTAL', rupee(order.total), true);

      // Footer
      doc.fillColor(INK3).font('Helvetica').fontSize(9);
      doc.text('Thank you for shopping with Dev Creation.', left, doc.page.height - 90, { align: 'center', width: right - left });
      doc.fillColor(GOLD).fontSize(8).text('Free shipping over Rs. 999  |  Returns within 14 days', left, doc.page.height - 74, { align: 'center', width: right - left, characterSpacing: 1 });

      doc.end();
    } catch (err) {
      reject(err as Error);
    }
  });
}

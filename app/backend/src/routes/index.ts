import { Router } from 'express';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import productRoutes from '@/routes/product.routes';
import categoryRoutes from '@/routes/category.routes';
import cartRoutes from '@/routes/cart.routes';
import orderRoutes from '@/routes/order.routes';
import notificationRoutes from '@/routes/notification.routes';
import adminRoutes from '@/routes/admin.routes';
import giftCardRoutes from '@/routes/giftCard.routes';

import { sendMail, sendMailWithDetails } from '@/config/mailer';
import { env } from '@/config/env';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      uptime: process.uptime(),
      smtpHost: env.SMTP_HOST,
      smtpPort: env.SMTP_PORT,
      smtpUser: env.SMTP_USER,
      emailFrom: env.EMAIL_FROM,
    },
  });
});

router.get('/test-email', async (req, res) => {
  const to = (req.query.to as string) || env.ADMIN_NOTIFY_EMAIL || 'support@devcreation24.in';
  try {
    const result = await sendMailWithDetails({
      to,
      subject: 'Dev Creation SMTP Test Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #2C1810; margin-top: 0;">Dev Creation SMTP Live Test</h2>
          <p style="font-size: 14px; color: #334155;">Hostinger SMTP is connected and working!</p>
          <div style="background-color: #f8fafc; padding: 12px 14px; border-radius: 6px; font-size: 13px; margin: 14px 0;">
            <p style="margin: 3px 0;"><strong>Recipient:</strong> ${to}</p>
            <p style="margin: 3px 0;"><strong>Server Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Dev Creation &bull; support@devcreation24.in</p>
        </div>
      `,
      text: `Dev Creation SMTP Live Test: Hostinger SMTP is working! Recipient: ${to}, Time: ${new Date().toISOString()}`,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: `Test email successfully sent to ${to}`,
        messageId: result.messageId,
        portUsed: result.portUsed,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send test email to ${to}`,
        error: result.error,
        code: result.code,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'SMTP send threw an error',
      error: err?.message || String(err),
    });
  }
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/gift-cards', giftCardRoutes);

export default router;

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

import { sendMail } from '@/config/mailer';
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
    const success = await sendMail({
      to,
      subject: 'Dev Creation SMTP Test Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; margin-top: 0;">✅ Dev Creation SMTP Live Test</h2>
          <p style="font-size: 15px; color: #334155;">Hostinger SMTP is connected and working perfectly!</p>
          <div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${to}</p>
            <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${env.SMTP_HOST}</p>
            <p style="margin: 4px 0;"><strong>Port:</strong> ${env.SMTP_PORT} (SSL)</p>
            <p style="margin: 4px 0;"><strong>From:</strong> ${env.EMAIL_FROM}</p>
            <p style="margin: 4px 0;"><strong>Server Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This is an automated test message from Dev Creation Backend.</p>
        </div>
      `,
      text: `Dev Creation SMTP Live Test: Hostinger SMTP is working! Recipient: ${to}, Time: ${new Date().toISOString()}`,
    });

    if (success) {
      return res.json({
        success: true,
        message: `Test email successfully sent to ${to}`,
        details: {
          to,
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          from: env.EMAIL_FROM,
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send test email to ${to}. Check backend server logs.`,
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

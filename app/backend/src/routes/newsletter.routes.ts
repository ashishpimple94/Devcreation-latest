import { Router } from 'express';
import { Subscriber } from '@/models/Subscriber';
import { sendMailWithDetails } from '@/config/mailer';
import { publishEvent } from '@/events/publisher';
import { logger } from '@/utils/logger';
import { authenticate, authorizeStaff } from '@/middleware/auth';
import { NOTIFICATION_TYPE } from '@/constants';

const router = Router();

// Email format regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter/subscribe
 * Real-time Dev Creation Circle subscription with 10% welcome code.
 */
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const discountCode = 'WELCOME10';
  const discountPercent = 10;

  try {
    let subscriber = await Subscriber.findOne({ email: normalizedEmail });
    const isNewSubscriber = !subscriber;

    if (!subscriber) {
      subscriber = await Subscriber.create({
        email: normalizedEmail,
        discountCode,
        discountPercent,
        source: 'footer_circle',
        isActive: true,
        welcomeEmailSent: false,
      });
    } else if (!subscriber.isActive) {
      subscriber.isActive = true;
      await subscriber.save();
    }

    // Send real-time welcome email if not already sent or if newly subscribed
    if (!subscriber.welcomeEmailSent) {
      sendMailWithDetails({
        to: normalizedEmail,
        subject: '✨ Welcome to Dev Creation Circle — Your 10% Luxury Gift Inside',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFDF8; border: 1px solid rgba(184,148,63,0.3); border-radius: 16px; overflow: hidden; padding: 36px 32px; color: #2C1810;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #8C6F2A; font-weight: 700;">Dev Creation Circle</span>
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 500; color: #2C1810; margin: 12px 0 6px 0;">Welcome to Our Fragrance Sanctuary</h1>
              <p style="font-size: 14px; color: #5A4E46; margin: 0; line-height: 1.6;">You are now part of our private fragrance circle. Enjoy handcrafted luxury wax sachets and master perfumer creations.</p>
            </div>

            <div style="background: #FAF6EF; border: 1.5px dashed #B8943F; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; color: #8C6F2A; margin: 0 0 8px 0; font-weight: 600;">Your Exclusive 10% Welcome Voucher</p>
              <div style="font-family: monospace; font-size: 28px; font-weight: 700; color: #2C1810; letter-spacing: 4px; background: #FFFFFF; display: inline-block; padding: 8px 24px; border-radius: 8px; border: 1px solid rgba(44,24,16,0.1);">
                ${discountCode}
              </div>
              <p style="font-size: 12px; color: #5A4E46; margin: 10px 0 0 0;">Valid on your first order across all artisanal wax sachets & gift sets.</p>
            </div>

            <div style="text-align: center; margin-top: 28px;">
              <a href="https://devcreation24.in/products" style="display: inline-block; background: #2C1810; color: #FFFFFF; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; padding: 14px 28px; border-radius: 10px; text-decoration: none;">
                Explore The Collection →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid rgba(44,24,16,0.08); margin: 32px 0 20px 0;" />
            <p style="font-size: 11px; color: #8C6F2A; text-align: center; margin: 0; line-height: 1.5;">
              Pure Soy Wax &bull; IFRA-Certified Oils &bull; Crafted in India<br />
              Questions? Concierge support: <a href="mailto:support@devcreation24.in" style="color: #2C1810;">support@devcreation24.in</a>
            </p>
          </div>
        `,
        text: `Welcome to Dev Creation Circle! Your 10% discount code is ${discountCode}. Use it at devcreation24.in/products on your first order.`,
      })
        .then((result) => {
          if (result.success) {
            Subscriber.updateOne({ _id: subscriber._id }, { welcomeEmailSent: true }).exec();
          }
        })
        .catch((err) => {
          logger.warn('Failed to send newsletter welcome email', { err: (err as Error).message });
        });
    }

    // Publish real-time notification to staff/admin room
    try {
      publishEvent({
        type: NOTIFICATION_TYPE.CUSTOMER_REGISTERED,
        title: 'New Circle Member',
        message: `${normalizedEmail} joined Dev Creation Circle`,
        toStaff: true,
        dashboardDirty: true,
      });
    } catch {
      /* non-fatal */
    }

    return res.json({
      success: true,
      message: isNewSubscriber
        ? 'Welcome to the Dev Creation Circle! Your 10% discount code is WELCOME10'
        : 'Welcome back! Your 10% discount code is WELCOME10',
      data: {
        email: normalizedEmail,
        discountCode,
        discountPercent,
      },
    });
  } catch (err: any) {
    logger.error('Newsletter subscribe error', { err: err?.message || String(err) });
    return res.status(500).json({
      success: false,
      message: 'Failed to complete subscription. Please try again.',
      error: err?.message,
    });
  }
});

/**
 * GET /api/newsletter/subscribers (Staff / Admin only)
 */
router.get('/subscribers', authenticate, authorizeStaff, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Subscriber.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments({ isActive: true }),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers.',
      error: err?.message,
    });
  }
});

export default router;

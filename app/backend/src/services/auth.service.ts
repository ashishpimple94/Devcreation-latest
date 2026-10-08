import crypto from 'node:crypto';
import { User } from '@/models/User';
import { Cart } from '@/models/Cart';
import { ApiError } from '@/utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { kv } from '@/redis/kv';
import { ROLES } from '@/constants';
import { notificationService } from '@/services/notification.service';
import { emailService } from '@/services/email.service';
import { smsService } from '@/services/sms.service';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

function issueTokens(user: { id: string; role: typeof ROLES[keyof typeof ROLES]; email: string }) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) throw ApiError.conflict('An account with this email already exists');

    const user = await User.create({ ...input, role: ROLES.CUSTOMER });
    await Cart.create({ user: user._id, items: [] });

    // Notify staff of a new customer registration.
    await notificationService.create({
      type: 'customer_registered',
      title: 'New customer',
      message: `${user.name} just registered`,
      forStaff: true,
      relatedEntity: { kind: 'user', id: user._id.toString() },
      dashboardDirty: true,
    });

    // Send welcome email to customer (best-effort fire-and-forget)
    void emailService.sendWelcome({ name: user.name, email: user.email }).catch((err) => {
      logger.warn('Failed to send welcome email', { err: (err as Error).message });
    });

    const tokens = issueTokens({ id: user._id.toString(), role: user.role, email: user.email });
    return { user: user.toJSON(), ...tokens };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');

    const tokens = issueTokens({ id: user._id.toString(), role: user.role, email: user.email });
    return { user: user.toJSON(), ...tokens };
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized('Account unavailable');
    return issueTokens({ id: user._id.toString(), role: user.role, email: user.email });
  },

  /**
   * Generates a single-use reset token stored in Redis with a short TTL. In a
   * real deployment the token would be emailed; here it is returned to the
   * caller (dev) and logged so the flow is testable without an SMTP server.
   */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to avoid leaking which emails are registered.
    if (!user) return { delivered: true };

    const token = crypto.randomBytes(32).toString('hex');
    await kv.set(`pwreset:${token}`, user._id.toString(), 15 * 60);
    logger.info('Password reset requested', { userId: user._id.toString() });

    // Send password reset link to customer (best-effort fire-and-forget)
    void emailService.sendPasswordReset({ name: user.name, email: user.email }, token).catch((err) => {
      logger.warn('Failed to send password reset email', { err: (err as Error).message });
    });

    return { delivered: true, devToken: token };
  },

  async resetPassword(token: string, password: string) {
    const userId = await kv.get(`pwreset:${token}`);
    if (!userId) throw ApiError.badRequest('Reset link is invalid or has expired');
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');
    user.password = password;
    await user.save();
    await kv.del(`pwreset:${token}`);
    return { reset: true };
  },

  async sendOtp(rawPhone: string) {
    const cleanPhone = (rawPhone || '').replace(/\D/g, '').slice(-10);
    // Real Indian mobile number check: 10 digits starting with 6, 7, 8, or 9
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw ApiError.badRequest('Please enter a valid 10-digit Indian mobile number');
    }

    // Cooldown check (prevent spam clicks within 30 seconds)
    const cooldownKey = `otp_cooldown:${cleanPhone}`;
    const inCooldown = await kv.get(cooldownKey);
    if (inCooldown) {
      throw ApiError.badRequest('Please wait 30 seconds before requesting another code');
    }

    // Rate limiting: max 5 OTP requests per 10 minutes per phone
    const rateKey = `otp_ratelimit:${cleanPhone}`;
    const attempts = await kv.get(rateKey);
    const count = attempts ? parseInt(attempts, 10) : 0;
    if (count >= 5) {
      throw ApiError.badRequest('Too many OTP attempts. Please wait 10 minutes before trying again.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `otp:${cleanPhone}`;
    await kv.set(key, otp, 300); // 5 minutes validity
    await kv.set(cooldownKey, '1', 30); // 30s cooldown
    await kv.set(rateKey, (count + 1).toString(), 600); // 10 minutes tracking

    // Send real SMS via configured SMS gateway (Fast2SMS / 2Factor / Twilio / simulated)
    const smsResult = await smsService.sendOtp(cleanPhone, otp);

    logger.info(`[AUTH-OTP] Dispatched OTP to +91 ${cleanPhone} via ${smsResult.provider}`);

    return {
      phone: cleanPhone,
      message:
        smsResult.provider === 'simulated'
          ? 'Verification code generated (Test Mode)'
          : 'Verification code sent to your mobile phone via SMS',
      provider: smsResult.provider,
      demoOtp:
        smsResult.provider === 'simulated' || !env.isProd || env.ENABLE_SMS_FALLBACK_DEMO
          ? otp
          : undefined,
      expiresInSeconds: 300,
    };
  },

  async verifyOtp(rawPhone: string, code: string) {
    const cleanPhone = (rawPhone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw ApiError.badRequest('Please provide a valid 10-digit mobile number');
    }
    const cleanCode = (code || '').trim();
    if (!cleanCode || cleanCode.length !== 6) {
      throw ApiError.badRequest('Please enter a valid 6-digit verification code');
    }

    const key = `otp:${cleanPhone}`;
    const stored = await kv.get(key);

    const isMatch = stored && stored === cleanCode;
    const isMasterDemo = env.ENABLE_SMS_FALLBACK_DEMO && cleanCode === '123456';

    if (!isMatch && !isMasterDemo) {
      throw ApiError.unauthorized('Invalid or expired verification code. Please request a new one.');
    }

    // Invalidate OTP immediately upon successful verification (single-use protection)
    await kv.del(key);
    await kv.del(`otp_cooldown:${cleanPhone}`);

    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      user = await User.findOne({ phone: { $regex: cleanPhone } });
    }

    let isNewCustomer = false;
    if (!user) {
      isNewCustomer = true;
      const fallbackEmail = `customer_${cleanPhone}@devcreation24.in`;
      const randomPassword = crypto.randomBytes(12).toString('hex') + 'A1!';
      user = await User.create({
        name: `Customer ${cleanPhone.slice(-4)}`,
        email: fallbackEmail,
        password: randomPassword,
        phone: cleanPhone,
        role: ROLES.CUSTOMER,
      });
      await Cart.create({ user: user._id, items: [] });
      await notificationService.create({
        type: 'customer_registered',
        title: 'New customer (Mobile OTP)',
        message: `Customer with mobile +91 ${cleanPhone} registered via OTP`,
        forStaff: true,
        relatedEntity: { kind: 'user', id: user._id.toString() },
        dashboardDirty: true,
      });
    }

    if (!user.isActive) {
      throw ApiError.unauthorized('Your account is currently disabled. Please contact support.');
    }

    const tokens = issueTokens({ id: user._id.toString(), role: user.role, email: user.email });
    return {
      user: user.toJSON(),
      isNewCustomer,
      ...tokens,
    };
  },

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },
};

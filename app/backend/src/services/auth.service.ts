import crypto from 'node:crypto';
import { User } from '@/models/User';
import { Cart } from '@/models/Cart';
import { ApiError } from '@/utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { kv } from '@/redis/kv';
import { ROLES } from '@/constants';
import { notificationService } from '@/services/notification.service';
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

  async me(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },
};

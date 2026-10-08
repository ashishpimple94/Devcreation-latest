import type { Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { sendSuccess } from '@/utils/apiResponse';
import { asyncHandler } from '@/utils/asyncHandler';
import { env } from '@/config/env';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: (env.isProd ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    return sendSuccess(res, result, 'Account created successfully', 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    // Accept both `email` (legacy field name) and `identifier` (mobile/phone login)
    const identifier: string = req.body.identifier || req.body.email || '';
    const { password } = req.body;
    const result = await authService.login(identifier, password);
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    // Also send refreshToken in JSON body so mobile clients can persist in localStorage
    // (iOS Safari / Android Chrome block cross-site httpOnly cookies on subdomains)
    return sendSuccess(res, result, 'Logged in successfully');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    // Accept token from: httpOnly cookie (desktop) OR request body (mobile localStorage fallback)
    const token = (req.cookies as Record<string, string>)?.refreshToken ?? req.body.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token provided' });
      return;
    }
    const tokens = await authService.refresh(token);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    // Also return refreshToken in body so mobile can save it to localStorage
    return sendSuccess(res, tokens, 'Token refreshed');
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
    return sendSuccess(res, null, 'Logged out');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, result, 'If the email exists, a reset link has been sent');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    return sendSuccess(res, result, 'Password updated. You can now log in.');
  }),

  sendOtp: asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    const result = await authService.sendOtp(phone);
    return sendSuccess(res, result, 'OTP sent successfully');
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp(phone, otp);
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    // Also return refreshToken in body for mobile localStorage fallback
    return sendSuccess(res, result, 'Logged in successfully via OTP');
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    return sendSuccess(res, user, 'Current user');
  }),
};

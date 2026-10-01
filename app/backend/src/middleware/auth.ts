import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { ApiError } from '@/utils/ApiError';
import { STAFF_ROLES, type Role } from '@/constants';

/** Extracts a bearer token from the Authorization header or the auth cookie. */
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.accessToken;
  return cookieToken ?? null;
}

/** Requires a valid access token. Populates `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Optional auth: populates `req.user` if a valid token is present, else continues. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
  } catch {
    /* ignore invalid token for optional routes */
  }
  return next();
}

/** Restricts a route to the given roles. Must run after `authenticate`. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    return next();
  };
}

/** Convenience guard for any staff role (super admin / admin / manager). */
export const authorizeStaff = authorize(...STAFF_ROLES);

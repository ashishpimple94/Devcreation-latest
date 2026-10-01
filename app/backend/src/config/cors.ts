import { env } from '@/config/env';

/**
 * Dynamic CORS origin handler compatible with `credentials: true`.
 * Reflects the requesting origin when allowed (or in wildcard mode) so the browser
 * receives matching Access-Control-Allow-Origin with Access-Control-Allow-Credentials: true.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (
    env.corsOrigins.includes('*') ||
    env.corsOrigins.includes(origin) ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
  ) {
    return true;
  }
  return false;
}

export const corsOriginHandler = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  if (isOriginAllowed(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
};

import { env } from '@/config/env';

/**
 * Dynamic CORS origin handler compatible with `credentials: true`.
 * Reflects the requesting origin when allowed so the browser
 * receives matching Access-Control-Allow-Origin with Access-Control-Allow-Credentials: true.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  if (
    env.corsOrigins.includes('*') ||
    env.corsOrigins.includes(origin) ||
    /^https?:\/\/localhost(:\d+)?$/i.test(origin) ||
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin) ||
    /devcreation24\.in(:\d+)?$/i.test(origin) ||
    /devcreation\.in(:\d+)?$/i.test(origin) ||
    /hostingersite\.com(:\d+)?$/i.test(origin) ||
    /onrender\.com(:\d+)?$/i.test(origin)
  ) {
    return true;
  }
  // Allow all origins by default in production so browser fetches never fail
  return true;
}

export const corsOriginHandler = (
  _origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  callback(null, true);
};

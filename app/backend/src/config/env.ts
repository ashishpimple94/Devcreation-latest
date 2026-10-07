import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Validates and normalises environment variables at startup. If a required
 * variable is missing or malformed the process exits immediately with a clear
 * message rather than failing later at runtime.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api'),

  CORS_ORIGIN: z.string().default('*'),

  MONGODB_URI: z
    .string()
    .default(
      'mongodb+srv://devcreation:devcreation@cluster0.ezzkjmw.mongodb.net/dev_creation?retryWrites=true&w=majority&appName=Cluster0',
    ),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16, 'JWT_ACCESS_SECRET must be at least 16 chars')
    .default('dev_access_secret_change_me_0123456789abcdef'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 chars')
    .default('dev_refresh_secret_change_me_0123456789abcdef'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  STORAGE_DRIVER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().default(5),
  PUBLIC_ASSET_BASE: z.string().default('http://localhost:4000'),

  SEED_ADMIN_NAME: z.string().default('Super Admin'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@devcreation.example'),
  SEED_ADMIN_PASSWORD: z.string().min(6).default('Admin@12345'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),

  // ── Email (SMTP Hostinger) ──────────────────────────
  SMTP_HOST: z.string().default('smtp.hostinger.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z
    .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
    .default('true')
    .transform((v) => v === true || v === 'true' || v === '1'),
  SMTP_USER: z.string().default('support@devcreation24.in'),
  SMTP_PASS: z.string().default('Devcreation@890*'),
  EMAIL_FROM: z.string().default('Dev Creation <support@devcreation24.in>'),
  ADMIN_NOTIFY_EMAIL: z.string().default('support@devcreation24.in'),
  STORE_URL: z.string().default('https://devcreation24.in'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((o) => o.trim()),
};

import winston from 'winston';
import { env } from '@/config/env';

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level} ${message}${rest}`;
  }),
);

/**
 * Structured application logger. Emits colourised text in development and JSON
 * in production so logs can be shipped to an aggregator. Never log secrets,
 * tokens or raw passwords through this.
 */
export const logger = winston.createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: env.isProd ? combine(timestamp(), json()) : devFormat,
  transports: [new winston.transports.Console()],
});

import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '@/utils/ApiError';
import { sendError } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

/** 404 handler for unknown routes. */
export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralised error handler. Normalises operational errors, Mongoose validation
 * / duplicate-key / cast errors and unknown errors into the consistent error
 * envelope. Stack traces are only exposed in non-production environments.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    const keys = Object.keys((err as { keyValue?: object }).keyValue ?? {});
    message = `Duplicate value for: ${keys.join(', ')}`;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  const isServerError = statusCode >= 500;
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id,
  };
  if (isServerError) {
    logger.error(message, { ...logPayload, stack: (err as Error).stack });
  } else {
    logger.warn(message, logPayload);
  }

  return sendError(
    res,
    statusCode,
    message,
    env.isProd ? details : details ?? (err instanceof Error ? { stack: err.stack } : undefined),
  );
}

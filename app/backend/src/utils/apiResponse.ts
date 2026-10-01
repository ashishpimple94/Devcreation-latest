import type { Response } from 'express';

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

/** Consistent success envelope: { success, message, data, meta? }. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Meta,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

/** Consistent error envelope: { success:false, message, error }. */
export function sendError(res: Response, statusCode: number, message: string, error?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ?? null,
  });
}

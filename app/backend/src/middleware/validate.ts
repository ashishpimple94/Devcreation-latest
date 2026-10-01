import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject, ZodEffects } from 'zod';
import { ApiError } from '@/utils/ApiError';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validates and coerces request `body`, `query` and `params` against a Zod
 * schema. On failure throws a 400 with a field-level error map so the client
 * can show inline messages. Backend validation is mandatory regardless of any
 * client-side checks.
 */
export function validate(schema: { body?: Schema; query?: Schema; params?: Schema }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) Object.assign(req.query, schema.query.parse(req.query));
      if (schema.params) Object.assign(req.params, schema.params.parse(req.params));
      return next();
    } catch (err) {
      const zodErr = err as { flatten?: () => unknown };
      return next(
        ApiError.badRequest('Validation failed', zodErr.flatten ? zodErr.flatten() : undefined),
      );
    }
  };
}
